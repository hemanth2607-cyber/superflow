# ==============================================================================
# SuperFlow: Google Colab Fine-Tuning Pipeline (Unsloth + QLoRA 4-bit)
# Trains Qwen2.5-Coder-7B or Llama-3.1 on competitive coding & mathematical proofs.
# Hardware: Runs completely free on Google Colab T4 (16GB VRAM) or A100 GPU.
# ==============================================================================

# 1. Install Unsloth and optimized dependencies
# Run in Colab:
"""
!pip install --no-deps "xformers<0.0.27" "trl<0.9.0" peft accelerate bitsandbytes
!pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
"""

import torch
from unsloth import FastLanguageModel
from trl import SFTTrainer
from transformers import TrainingArguments
from datasets import load_dataset

# 2. Configuration
max_seq_length = 4096  # 4k context window
dtype = None           # Auto detect (Float16 for T4, Bfloat16 for Ampere+)
load_in_4bit = True    # 4-bit quantization saves 70% VRAM

model_name = "unsloth/Qwen2.5-Coder-7B-Instruct"

print(f"Loading base model: {model_name}...")
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name=model_name,
    max_seq_length=max_seq_length,
    dtype=dtype,
    load_in_4bit=load_in_4bit,
)

# 3. Add LoRA Adapters
model = FastLanguageModel.get_peft_model(
    model,
    r=16,                # Rank (16 or 32 gives ideal reasoning capacity)
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                    "gate_proj", "up_proj", "down_proj"],
    lora_alpha=16,
    lora_dropout=0,      # Optimized 0 for Unsloth
    bias="none",
    use_gradient_checkpointing="unsloth",
    random_state=3407,
)

# 4. Format Dataset
# Upload your superflow_train_data.jsonl file to Google Colab root
dataset_path = "superflow_train_data.jsonl"

def formatting_prompts_func(examples):
    convos = examples["messages"]
    texts = [tokenizer.apply_chat_template(convo, tokenize=False, add_generation_prompt=False) for convo in convos]
    return {"text": texts}

dataset = load_dataset("json", data_files=dataset_path, split="train")
dataset = dataset.map(formatting_prompts_func, batched=True)

# 5. Trainer Setup
trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    dataset_text_field="text",
    max_seq_length=max_seq_length,
    dataset_num_proc=2,
    packing=False,       # Set True for very short snippets
    args=TrainingArguments(
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        warmup_steps=10,
        max_steps=120,    # Adjust based on dataset size (e.g. 2-3 epochs)
        learning_rate=2e-4,
        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),
        logging_steps=1,
        optim="adamw_8bit",
        weight_decay=0.01,
        lr_scheduler_type="cosine",
        seed=3407,
        output_dir="superflow_checkpoints",
    ),
)

# 6. Start Training
print("Starting SuperFlow fine-tuning...")
trainer_stats = trainer.train()

# 7. Save and Export to GGUF (for 1-click Ollama import)
print("Exporting model to GGUF (q4_k_m) for Ollama...")
model.save_pretrained_gguf("superflow-coder-7b", tokenizer, quantization_method="q4_k_m")

print("""
Training and GGUF Export Complete!
To use this model in your local Ollama:
1. Download the exported file 'superflow-coder-7b-Q4_K_M.gguf' from Colab to your machine.
2. Create a Modelfile:
   FROM ./superflow-coder-7b-Q4_K_M.gguf
   PARAMETER temperature 0.2
   PARAMETER top_p 0.95
3. Run: ollama create superflow -f Modelfile
4. Now SuperFlow can target --model superflow!
""")

import React from 'react'
import { PuppetStage } from '../puppet/PuppetStage'

export const StageCanvas: React.FC = () => {
  return (
    <div className="relative w-full overflow-visible">
      <PuppetStage />
    </div>
  )
}

export default StageCanvas

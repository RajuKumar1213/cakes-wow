import React, { useState, useRef } from 'react'
import { X, Crop, RotateCcw } from 'lucide-react'
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop as CropType,
  PixelCrop,
  convertToPixelCrop,
} from 'react-image-crop'
import { canvasPreview } from '@/app/crop/canvasPreview'
import { useDebounceEffect } from '@/app/crop/useDebounceEffect'

import 'react-image-crop/dist/ReactCrop.css'

// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 100, // Use 100% to show the entire image by default
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onSave: (croppedImageUrl: string) => void;
}

export default function CropModal({ isOpen, onClose, imageSrc, onSave }: CropModalProps) {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<CropType>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const aspect = 1 // Fixed to 1:1 square aspect ratio

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    const newCrop = centerAspectCrop(width, height, aspect)
    setCrop(newCrop)
    setCompletedCrop(convertToPixelCrop(newCrop, width, height))
  }

  const handleResetCrop = () => {
    if (imgRef.current) {
      const { width, height } = imgRef.current
      const newCrop = centerAspectCrop(width, height, aspect)
      setCrop(newCrop)
      setCompletedCrop(convertToPixelCrop(newCrop, width, height))
    }
  }

  const handleSaveCrop = async () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      console.error('Missing required elements for crop save')
      return
    }

    const image = imgRef.current
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      console.error('Could not get canvas context')
      return
    }

    try {
      // Use the natural dimensions for proper scaling
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      // Set canvas size to match the desired output size
      canvas.width = completedCrop.width * scaleX
      canvas.height = completedCrop.height * scaleY

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw the cropped portion from the natural image
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height,
      )

      // Convert to data URL
      const croppedDataUrl = canvas.toDataURL('image/png', 0.95)
      
      if (croppedDataUrl && croppedDataUrl !== 'data:,') {
        onSave(croppedDataUrl)
        onClose()
      } else {
        console.error('Failed to generate cropped image data URL')
      }
    } catch (error) {
      console.error('Error during crop save:', error)
    }
  }

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          1,
          0,
        )
      }
    },
    100,
    [completedCrop],
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Crop className="w-5 h-5 text-blue-600" />
            Crop Image
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="p-4">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: '350px' }}>
            {imageSrc && (
              <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ReactCrop
                  crop={crop}
                  onChange={(pixelCrop, percentCrop) => {
                    setCrop(percentCrop)
                  }}
                  onComplete={(pixelCrop, percentCrop) => {
                    if (imgRef.current) {
                      setCompletedCrop(pixelCrop)
                    }
                  }}
                  aspect={aspect}
                  minWidth={50}
                  minHeight={50}
                  keepSelection={true}
                  ruleOfThirds={true}
                  circularCrop={false}
                >
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Crop preview"
                    onLoad={onImageLoad}
                    style={{ 
                      maxHeight: '320px',
                      maxWidth: '100%',
                      display: 'block'
                    }}
                  />
                </ReactCrop>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={handleResetCrop}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Crop
            </button>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCrop}
                disabled={!completedCrop}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Crop className="w-4 h-4" />
                Save & Continue
              </button>
            </div>
          </div>
        </div>

        {/* Hidden canvas for crop processing */}
        <canvas ref={previewCanvasRef} className="hidden" />
      </div>
    </div>
  )
}

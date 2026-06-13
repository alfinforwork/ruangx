import type { UploadResponse } from '@/types/api'
import { uploadApi } from './client'

export const uploadApiClient = {
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return uploadApi<UploadResponse>('/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let ofetch set multipart boundary
    })
  },
}
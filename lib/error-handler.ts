import { toast } from "sonner"

export interface ApiError {
  message: string
  status?: number
  code?: string
}

export class ErrorHandler {
  static handleApiError(error: any): ApiError {
    // Handle different types of errors
    if (error.response) {
      // HTTP error response
      return {
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        code: error.response.data?.code
      }
    } else if (error.request) {
      // Network error
      return {
        message: 'Network error. Please check your connection.',
        status: 0,
        code: 'NETWORK_ERROR'
      }
    } else if (error instanceof Error) {
      // JavaScript error
      return {
        message: error.message,
        code: 'JS_ERROR'
      }
    } else {
      // Unknown error
      return {
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR'
      }
    }
  }

  static showError(error: any, customMessage?: string) {
    const apiError = this.handleApiError(error)
    const message = customMessage || apiError.message
    
    toast.error(message, {
      description: apiError.status ? `Error ${apiError.status}` : undefined,
      duration: 5000,
    })
  }

  static showSuccess(message: string, description?: string) {
    toast.success(message, {
      description,
      duration: 3000,
    })
  }

  static showWarning(message: string, description?: string) {
    toast.warning(message, {
      description,
      duration: 4000,
    })
  }

  static showInfo(message: string, description?: string) {
    toast.info(message, {
      description,
      duration: 3000,
    })
  }

  // Form validation error handler
  static handleFormErrors(errors: Record<string, string[]>) {
    const firstError = Object.values(errors)[0]?.[0]
    if (firstError) {
      this.showError({ message: firstError })
    }
  }

  // Async operation wrapper with error handling
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    options?: {
      successMessage?: string
      errorMessage?: string
      showLoading?: boolean
    }
  ): Promise<T | null> {
    try {
      if (options?.showLoading) {
        toast.loading('Processing...', { id: 'loading' })
      }

      const result = await operation()

      if (options?.showLoading) {
        toast.dismiss('loading')
      }

      if (options?.successMessage) {
        this.showSuccess(options.successMessage)
      }

      return result
    } catch (error) {
      if (options?.showLoading) {
        toast.dismiss('loading')
      }

      this.showError(error, options?.errorMessage)
      return null
    }
  }
}

// Utility functions for common error scenarios
export const handleAuthError = (error: any) => {
  const apiError = ErrorHandler.handleApiError(error)
  
  if (apiError.status === 401) {
    ErrorHandler.showError(error, 'Please sign in to continue')
    // Redirect to login page
    window.location.href = '/auth/signin'
  } else if (apiError.status === 403) {
    ErrorHandler.showError(error, 'You do not have permission to perform this action')
  } else {
    ErrorHandler.showError(error)
  }
}

export const handleValidationError = (error: any) => {
  const apiError = ErrorHandler.handleApiError(error)
  
  if (apiError.status === 400) {
    ErrorHandler.showError(error, 'Please check your input and try again')
  } else {
    ErrorHandler.showError(error)
  }
}

export const handleNetworkError = (error: any) => {
  ErrorHandler.showError(error, 'Connection failed. Please check your internet connection and try again.')
}
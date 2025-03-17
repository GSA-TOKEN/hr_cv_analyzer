"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

export type ToastVariant = 'default' | 'destructive' | 'success'

export interface ToastProps {
    id: string
    title: string
    description?: string
    variant?: ToastVariant
    duration?: number
}

type ToastContextType = {
    toasts: ToastProps[]
    addToast: (toast: Omit<ToastProps, 'id'>) => string
    removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastProps[]>([])

    const addToast = (toast: Omit<ToastProps, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9)
        const newToast: ToastProps = {
            id,
            ...toast,
            duration: toast.duration || 5000, // Default 5 seconds
        }
        setToasts((prev) => [...prev, newToast])
        return id
    }

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }

    // Auto remove toasts after their duration
    useEffect(() => {
        const timers = toasts.map((toast) => {
            return setTimeout(() => {
                removeToast(toast.id)
            }, toast.duration)
        })

        return () => {
            timers.forEach(clearTimeout)
        }
    }, [toasts])

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            {toasts.length > 0 && (
                <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                    {toasts.map((toast) => (
                        <ToastItem
                            key={toast.id}
                            toast={toast}
                            onDismiss={() => removeToast(toast.id)}
                        />
                    ))}
                </div>
            )}
        </ToastContext.Provider>
    )
}

function ToastItem({
    toast,
    onDismiss
}: {
    toast: ToastProps
    onDismiss: () => void
}) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Trigger animation after mount
        const timer = setTimeout(() => setIsVisible(true), 10)
        return () => clearTimeout(timer)
    }, [])

    let bgColor = 'bg-white'
    let icon = <Info className="h-5 w-5 text-blue-500" />

    if (toast.variant === 'destructive') {
        bgColor = 'bg-red-50 border-red-200'
        icon = <AlertCircle className="h-5 w-5 text-red-500" />
    } else if (toast.variant === 'success') {
        bgColor = 'bg-green-50 border-green-200'
        icon = <CheckCircle className="h-5 w-5 text-green-500" />
    }

    return (
        <div
            className={`transform transition-all duration-300 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                }`}
        >
            <div className={`max-w-md overflow-hidden rounded-lg border shadow-lg ${bgColor}`}>
                <div className="flex p-4">
                    <div className="flex-shrink-0">
                        {icon}
                    </div>
                    <div className="ml-3 w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">{toast.title}</p>
                        {toast.description && (
                            <p className="mt-1 text-sm text-gray-500">{toast.description}</p>
                        )}
                    </div>
                    <div className="ml-4 flex flex-shrink-0">
                        <button
                            type="button"
                            className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                            onClick={onDismiss}
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
} 
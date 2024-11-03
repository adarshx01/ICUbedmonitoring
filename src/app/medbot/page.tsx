'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mic, Send, Loader2 } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"

export default function MedicalChatbot() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'bot', content: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('')
        setTranscript(transcript)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [chatHistory])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      recognitionRef.current?.start()
    }
    setIsListening(!isListening)
  }

  const handleSend = async () => {
    if (!transcript.trim()) return

    setChatHistory(prev => [...prev, { role: 'user', content: transcript }])
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: transcript }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      setChatHistory(prev => [...prev, { role: 'bot', content: data.answer }])
    } catch (error) {
      console.error('Error:', error)
      setChatHistory(prev => [...prev, { role: 'bot', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setIsLoading(false)
      setTranscript('')
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Medical Assistant</CardTitle>
          <CardDescription className="text-center">Ask me anything about medical dosages and treatments</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full pr-4" ref={scrollAreaRef}>
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-center">
                <Loader2 className="w-6 h-6 animate-spin inline-block" />
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex w-full space-x-2">
            <Input
              placeholder="Type your medical question..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={toggleListening} variant={isListening ? "destructive" : "secondary"}>
              <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
            </Button>
            <Button onClick={handleSend} disabled={isLoading || !transcript.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {isListening && (
            <div className="text-sm text-muted-foreground animate-pulse">
              Listening...
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
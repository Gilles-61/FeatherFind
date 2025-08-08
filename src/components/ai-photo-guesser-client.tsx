
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { getAiBirdSuggestionsFromPhoto, type GuesserState } from "@/app/ai-photo-guesser/actions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BirdCard } from "@/components/bird-card";
import { Loader2, AlertCircle, Sparkles, Upload, Image as ImageIcon, Camera } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const initialState: GuesserState = {};

function SubmitButton({ disabled, dictionary }: { disabled: boolean, dictionary: any }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {dictionary.buttonPending}
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          {dictionary.buttonIdle}
        </>
      )}
    </Button>
  );
}

export function AIPhotoGuesserClient({ dictionary }: { dictionary: any }) {
  const [state, formAction] = useActionState(getAiBirdSuggestionsFromPhoto, initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [mode, setMode] = useState<"upload" | "camera">("upload");
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

   useEffect(() => {
    const stream = videoRef.current?.srcObject as MediaStream;
    if (mode === "camera" && dictionary) {
      const getCameraPermission = async () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        try {
          const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = newStream;
          }
        } catch (error) {
          console.error("Error accessing camera:", error);
          setHasCameraPermission(false);
          toast({
            variant: "destructive",
            title: dictionary.cameraError.title,
            description: dictionary.cameraError.description,
          });
        }
      };
      getCameraPermission();
    } else {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [mode, toast, dictionary]);

  if (!dictionary) {
    return null; // Or a loading skeleton
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setPreview(dataUri);
        setPhotoData(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL("image/jpeg");
        setPreview(dataUri);
        setPhotoData(dataUri);
        setMode("upload");
      }
    }
  };
  
  const resetPhoto = () => {
    setPreview(null);
    setPhotoData(null);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="photo" value={photoData || ""} />

        <Tabs value={mode} onValueChange={(value) => setMode(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4"/>{dictionary.uploadTab}</TabsTrigger>
                <TabsTrigger value="camera"><Camera className="mr-2 h-4 w-4"/>{dictionary.cameraTab}</TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
                 <Card className="p-6">
                    {preview ? (
                         <div className="relative w-full aspect-video">
                            <Image src={preview} alt={dictionary.imageAlt} layout="fill" className="object-contain rounded-md" />
                            <Button variant="destructive" size="sm" onClick={resetPhoto} className="absolute top-2 right-2">
                                {dictionary.retakeButton}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center aspect-video border-2 border-dashed rounded-lg">
                            <label htmlFor="photo-upload" className="text-center text-muted-foreground p-4 cursor-pointer">
                                <ImageIcon className="mx-auto h-12 w-12" />
                                <p>{dictionary.uploadPlaceholder}</p>
                                 <input id="photo-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>
                    )}
                </Card>
            </TabsContent>
            <TabsContent value="camera">
                <Card className="p-6">
                   <div className="flex items-center justify-center aspect-video border-2 border-dashed rounded-lg bg-black">
                        <video ref={videoRef} className="w-full h-full object-contain" autoPlay muted playsInline />
                        <canvas ref={canvasRef} className="hidden"></canvas>
                   </div>
                    {hasCameraPermission === false && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{dictionary.cameraError.title}</AlertTitle>
                            <AlertDescription>
                               {dictionary.cameraError.permission}
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="mt-4 flex justify-center">
                        <Button type="button" onClick={handleCapture} disabled={!hasCameraPermission}>
                            <Camera className="mr-2 h-4 w-4"/>
                            {dictionary.captureButton}
                        </Button>
                    </div>
                </Card>
            </TabsContent>
        </Tabs>
        
        {state?.message && <p className="text-sm font-medium text-destructive">{state.message}</p>}

        <div className="text-center">
          <SubmitButton disabled={!photoData} dictionary={dictionary} />
        </div>
      </form>

      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{dictionary.errorTitle}</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state?.suggestions && (
        <div className="space-y-6">
          <h2 className="text-3xl font-headline text-center text-primary">{dictionary.suggestionsTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {state.suggestions.map((bird) => (
              <Link href={`/explore/${bird.id}`} key={bird.id} className="block">
                <BirdCard bird={bird} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

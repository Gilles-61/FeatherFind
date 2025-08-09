"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useTransition, useRef, useEffect } from "react";
import { guessBirdFromPhotoAction } from "./actions";
import { Bird, Camera, Lightbulb, Loader2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { BirdCard } from "@/components/bird-card";
import type { Bird as BirdType, BirdResult } from "@/types";
import { getBirdById } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function PhotoGuesserPage() {
  const [result, setResult] = useState<BirdResult | null>(null);
  const [birdDetails, setBirdDetails] = useState<BirdType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera access is not supported by your browser.");
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setError("Camera access was denied. Please enable camera permissions in your browser settings.");
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    getCameraPermission();
    
    // Cleanup function to stop the video stream
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [toast]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUri);
        setError(null);
        setResult(null);
        setBirdDetails(null);
      }
    }
  };
  
  const handleRetake = () => {
      setCapturedImage(null);
      setResult(null);
      setBirdDetails(null);
      setError(null);
  }

  const handleSubmit = () => {
    if (!capturedImage) {
        setError("Please capture an image first.");
        return;
    }
    setError(null);
    setResult(null);
    setBirdDetails(null);

    startTransition(async () => {
      const { result, error } = await guessBirdFromPhotoAction({photoDataUri: capturedImage});
      if (error) {
        setError(error);
      } else if (result) {
        setResult(result);
        const foundBird = await getBirdById(result.birdId);
        if(foundBird) {
            setBirdDetails(foundBird);
        }
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold text-primary flex items-center justify-center gap-3">
            <Camera className="h-10 w-10"/> Photo Guesser
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
            Use your camera to take a picture of a bird, and our AI will try to identify it.
        </p>
      </div>

      <Card>
          <CardHeader>
            <CardTitle>Camera</CardTitle>
            <CardDescription>Point your camera at a bird and capture a clear picture.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full aspect-video rounded-md overflow-hidden border">
                {capturedImage ? (
                    <Image src={capturedImage} alt="Captured bird" layout="fill" objectFit="cover" />
                ) : (
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                )}
                 {hasCameraPermission === false && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-4">
                        <Camera className="h-12 w-12 text-destructive mb-4" />
                        <h3 className="text-xl font-semibold text-destructive-foreground">Camera Access Required</h3>
                        <p className="text-destructive-foreground/80">Please enable camera permissions in your browser to use this feature.</p>
                    </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            {capturedImage ? (
                <>
                    <Button onClick={handleRetake} variant="outline" disabled={isPending}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retake Photo
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bird className="mr-2 h-4 w-4" />}
                        Identify Bird
                    </Button>
                </>
            ) : (
                <Button onClick={handleCapture} disabled={!hasCameraPermission || isPending}>
                    <Camera className="mr-2 h-4 w-4" />
                    Capture Photo
                </Button>
            )}
          </CardFooter>
      </Card>
      

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle>AI Analysis Complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>AI Reasoning</AlertTitle>
                <AlertDescription className="italic">
                    "{result.reasoning}"
                </AlertDescription>
            </Alert>
            
            {birdDetails ? (
              <div>
                <h3 className="text-lg font-semibold text-center mb-4 text-primary">Our best guess is the <span className="font-bold">{result.birdName}</span>.</h3>
                <Link href={`/explore/${birdDetails.id}`}>
                    <BirdCard bird={birdDetails} />
                </Link>
              </div>
            ) : (
                <p className="text-center text-muted-foreground">Could not load details for the guessed bird.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

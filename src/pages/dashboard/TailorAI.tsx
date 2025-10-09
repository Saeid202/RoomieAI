import { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Camera, CameraOff, Sparkles, Target, Save, Database, Palette, Shirt, Check, Calculator, Factory } from "lucide-react";
import { MeasurementsService, BodyMeasurements } from '@/services/measurementsService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DesignCanvas from '@/components/fashion/DesignCanvas';
import CostCalculator from '@/components/fashion/CostCalculator';
import { CostEstimate, CustomDesign } from '@/services/fashionPlatformService';

interface Measurements {
  shoulders: number;
  neck: number;
  leftArm: number;
  rightArm: number;
  chest: number;
  waist: number;
  hips: number;
  leftLeg: number;
  rightLeg: number;
  height: number;
}

interface SizeRecommendation {
  top: string;
  bottom: string;
  confidence: string;
}

export default function TailorAIPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [measurements, setMeasurements] = useState<Measurements>({
    shoulders: 0,
    neck: 0,
    leftArm: 0,
    rightArm: 0,
    chest: 0,
    waist: 0,
    hips: 0,
    leftLeg: 0,
    rightLeg: 0,
    height: 0,
  });
  const [sizeRecommendation, setSizeRecommendation] = useState<SizeRecommendation>({
    top: '-',
    bottom: '-',
    confidence: 'low'
  });
  const [capturedMeasurements, setCapturedMeasurements] = useState<Measurements | null>(null);
  const [isAutoCaptureEnabled, setIsAutoCaptureEnabled] = useState(true);
  const [captureStatus, setCaptureStatus] = useState<'waiting' | 'detecting' | 'captured'>('waiting');
  const [measurementHistory, setMeasurementHistory] = useState<BodyMeasurements[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedSuitStyles, setSelectedSuitStyles] = useState<string[]>([]);
  const [currentDesign, setCurrentDesign] = useState<CustomDesign | null>(null);
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const animationFrameRef = useRef<number>();

  // Suit style options with images
  const suitStyles = [
    {
      id: 'classic',
      name: 'Classic Business',
      description: 'Traditional, formal business suits',
      icon: '👔',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face',
      features: ['Single-breasted', 'Notch lapels', 'Conservative colors']
    },
    {
      id: 'modern',
      name: 'Modern Slim',
      description: 'Contemporary slim-fit suits',
      icon: '🎩',
      image: 'https://images.unsplash.com/photo-1566479179817-c0d9a6a7c9e8?w=300&h=400&fit=crop&crop=face',
      features: ['Slim fit', 'Narrow lapels', 'Modern colors']
    },
    {
      id: 'double-breasted',
      name: 'Double-Breasted',
      description: 'Sophisticated double-breasted style',
      icon: '🤵',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=400&fit=crop&crop=face',
      features: ['Double-breasted', 'Wide lapels', 'Formal occasions']
    },
    {
      id: 'casual',
      name: 'Casual Blazer',
      description: 'Relaxed, casual blazer style',
      icon: '🧥',
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=400&fit=crop&crop=face',
      features: ['Unstructured', 'Casual fabrics', 'Versatile styling']
    },
    {
      id: 'tuxedo',
      name: 'Tuxedo/Black Tie',
      description: 'Formal evening wear',
      icon: '🎭',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&crop=face',
      features: ['Shawl lapels', 'Formal accessories', 'Evening events']
    },
    {
      id: 'italian',
      name: 'Italian Style',
      description: 'Elegant Italian tailoring',
      icon: '🇮🇹',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=400&fit=crop&crop=face',
      features: ['Soft shoulders', 'High armholes', 'Elegant drape']
    }
  ];

  const toggleSuitStyle = (styleId: string) => {
    setSelectedSuitStyles(prev => 
      prev.includes(styleId) 
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    );
  };

  useEffect(() => {
    const initModel = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numPoses: 1
        });
        setPoseLandmarker(landmarker);
        setIsModelLoading(false);
      } catch (error) {
        console.error('Error loading model:', error);
        setIsModelLoading(false);
      }
    };
    initModel();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    loadMeasurementHistory();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
          detectPose();
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  const recommendSize = (measurements: Measurements): SizeRecommendation => {
    const { chest, waist, hips, height } = measurements;
    
    if (chest === 0 || height === 0) {
      return { top: '-', bottom: '-', confidence: 'low' };
    }

    let topSize = '-';
    let bottomSize = '-';
    let confidence = 'medium';

    // Top size based on chest measurement
    if (chest < 30) topSize = 'XS';
    else if (chest < 35) topSize = 'S';
    else if (chest < 42) topSize = 'M';
    else if (chest < 48) topSize = 'L';
    else if (chest < 55) topSize = 'XL';
    else topSize = 'XXL';

    // Bottom size based on waist/hips
    const waistHips = Math.max(waist, hips);
    if (waistHips < 25) bottomSize = 'XS';
    else if (waistHips < 30) bottomSize = 'S';
    else if (waistHips < 37) bottomSize = 'M';
    else if (waistHips < 43) bottomSize = 'L';
    else if (waistHips < 50) bottomSize = 'XL';
    else bottomSize = 'XXL';

    if (waist > 0 && hips > 0) {
      confidence = 'high';
    }

    return { top: topSize, bottom: bottomSize, confidence };
  };

  const checkMeasurementQuality = (measurements: Measurements): boolean => {
    // Check if we have enough key measurements for reliable sizing
    const hasKeyMeasurements = 
      measurements.height > 0 &&
      measurements.chest > 0 &&
      measurements.shoulders > 0 &&
      measurements.waist > 0;

    // Check if measurements are within reasonable ranges
    const hasReasonableRanges = 
      measurements.height > 50 && measurements.height < 300 &&
      measurements.chest > 20 && measurements.chest < 80 &&
      measurements.waist > 15 && measurements.waist < 70;

    return hasKeyMeasurements && hasReasonableRanges;
  };

  const autoCaptureMeasurement = (measurements: Measurements) => {
    if (checkMeasurementQuality(measurements) && isAutoCaptureEnabled && captureStatus !== 'captured') {
      setCapturedMeasurements(measurements);
      setCaptureStatus('captured');
      saveMeasurementsToDatabase(measurements, sizeRecommendation);
      setTimeout(() => { setCaptureStatus('waiting'); }, 3000);
    }
  };

  const saveMeasurementsToDatabase = async (measurements: Measurements, recommendations: SizeRecommendation) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to save measurements');
        return;
      }

      await MeasurementsService.saveMeasurements({
        user_id: user.id,
        height: measurements.height,
        shoulders: measurements.shoulders,
        neck: measurements.neck,
        left_arm: measurements.leftArm,
        right_arm: measurements.rightArm,
        chest: measurements.chest,
        waist: measurements.waist,
        hips: measurements.hips,
        left_leg: measurements.leftLeg,
        right_leg: measurements.rightLeg,
        recommended_top_size: recommendations.top,
        recommended_bottom_size: recommendations.bottom,
        confidence_level: recommendations.confidence as 'low' | 'medium' | 'high'
      });

      toast.success('Measurements saved successfully!');
      loadMeasurementHistory();
    } catch (error) {
      console.error('Error saving measurements:', error);
      toast.error('Failed to save measurements');
    }
  };

  const loadMeasurementHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const history = await MeasurementsService.getUserMeasurements();
      setMeasurementHistory(history);
    } catch (error) {
      console.error('Error loading measurement history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const detectPose = async () => {
    if (!poseLandmarker || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    let lastVideoTime = -1;
    const detect = async () => {
      if (!video.videoWidth || !video.videoHeight) {
        animationFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      const startTimeMs = performance.now();
      if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        const results = poseLandmarker.detectForVideo(video, startTimeMs);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          const drawingUtils = new DrawingUtils(ctx);

          ctx.strokeStyle = '#2dd4bf';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#2dd4bf';
          ctx.shadowBlur = 10;

          const connections = [
            [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
          ];

          connections.forEach(([i, j]) => {
            const lm1 = landmarks[i];
            const lm2 = landmarks[j];
            if (lm1.visibility && lm2.visibility && lm1.visibility > 0.5 && lm2.visibility > 0.5) {
              ctx.beginPath();
              ctx.moveTo(lm1.x * canvas.width, lm1.y * canvas.height);
              ctx.lineTo(lm2.x * canvas.width, lm2.y * canvas.height);
              ctx.stroke();
            }
          });

          landmarks.forEach((landmark) => {
            if (landmark.visibility && landmark.visibility > 0.5) {
              ctx.fillStyle = '#c026d3';
              ctx.shadowColor = '#c026d3';
              ctx.shadowBlur = 15;
              ctx.beginPath();
              ctx.arc(
                landmark.x * canvas.width,
                landmark.y * canvas.height,
                6,
                0,
                2 * Math.PI
              );
              ctx.fill();
            }
          });

          ctx.shadowBlur = 0;

          // Draw detection zone (green/orange frame)
          const isGoodQuality = checkMeasurementQuality(measurements);
          const zoneColor = isGoodQuality ? '#10b981' : '#f59e0b';
          ctx.strokeStyle = zoneColor;
          ctx.lineWidth = 4;
          ctx.shadowColor = zoneColor;
          ctx.shadowBlur = 15;
          ctx.setLineDash([10, 5]);
          ctx.strokeRect(
            canvas.width * 0.1,
            canvas.height * 0.1,
            canvas.width * 0.8,
            canvas.height * 0.8
          );
          ctx.setLineDash([]);
          ctx.shadowBlur = 0;

          // Calculate measurements
          const nose = landmarks[0];
          const leftShoulder = landmarks[11];
          const rightShoulder = landmarks[12];
          const leftElbow = landmarks[13];
          const rightElbow = landmarks[14];
          const leftWrist = landmarks[15];
          const rightWrist = landmarks[16];
          const leftHip = landmarks[23];
          const rightHip = landmarks[24];
          const leftKnee = landmarks[25];
          const rightKnee = landmarks[26];
          const leftAnkle = landmarks[27];
          const rightAnkle = landmarks[28];

          if (
            leftShoulder.visibility && rightShoulder.visibility &&
            leftShoulder.visibility > 0.5 && rightShoulder.visibility > 0.5
          ) {
            const shoulderWidth = calculateDistance(
              leftShoulder.x * canvas.width, leftShoulder.y * canvas.height,
              rightShoulder.x * canvas.width, rightShoulder.y * canvas.height
            );

            const neckLength = nose.visibility && nose.visibility > 0.5 ? calculateDistance(
              nose.x * canvas.width, nose.y * canvas.height,
              ((leftShoulder.x + rightShoulder.x) / 2) * canvas.width,
              ((leftShoulder.y + rightShoulder.y) / 2) * canvas.height
            ) : 0;

            const leftArmLength = leftElbow.visibility && leftWrist.visibility &&
              leftElbow.visibility > 0.5 && leftWrist.visibility > 0.5 ? calculateDistance(
                leftShoulder.x * canvas.width, leftShoulder.y * canvas.height,
                leftElbow.x * canvas.width, leftElbow.y * canvas.height
              ) + calculateDistance(
                leftElbow.x * canvas.width, leftElbow.y * canvas.height,
                leftWrist.x * canvas.width, leftWrist.y * canvas.height
              ) : 0;

            const rightArmLength = rightElbow.visibility && rightWrist.visibility &&
              rightElbow.visibility > 0.5 && rightWrist.visibility > 0.5 ? calculateDistance(
                rightShoulder.x * canvas.width, rightShoulder.y * canvas.height,
                rightElbow.x * canvas.width, rightElbow.y * canvas.height
              ) + calculateDistance(
                rightElbow.x * canvas.width, rightElbow.y * canvas.height,
                rightWrist.x * canvas.width, rightWrist.y * canvas.height
              ) : 0;

            const chestWidth = shoulderWidth;
            const waistWidth = leftHip.visibility && rightHip.visibility &&
              leftHip.visibility > 0.5 && rightHip.visibility > 0.5 ? calculateDistance(
                leftHip.x * canvas.width, leftHip.y * canvas.height,
                rightHip.x * canvas.width, rightHip.y * canvas.height
              ) : 0;
            const hipWidth = waistWidth;

            const leftLegLength = leftHip.visibility && leftKnee.visibility && leftAnkle.visibility &&
              leftHip.visibility > 0.5 && leftKnee.visibility > 0.5 && leftAnkle.visibility > 0.5 ? calculateDistance(
                leftHip.x * canvas.width, leftHip.y * canvas.height,
                leftKnee.x * canvas.width, leftKnee.y * canvas.height
              ) + calculateDistance(
                leftKnee.x * canvas.width, leftKnee.y * canvas.height,
                leftAnkle.x * canvas.width, leftAnkle.y * canvas.height
              ) : 0;

            const rightLegLength = rightHip.visibility && rightKnee.visibility && rightAnkle.visibility &&
              rightHip.visibility > 0.5 && rightKnee.visibility > 0.5 && rightAnkle.visibility > 0.5 ? calculateDistance(
                rightHip.x * canvas.width, rightHip.y * canvas.height,
                rightKnee.x * canvas.width, rightKnee.y * canvas.height
              ) + calculateDistance(
                rightKnee.x * canvas.width, rightKnee.y * canvas.height,
                rightAnkle.x * canvas.width, rightAnkle.y * canvas.height
              ) : 0;

            const avgAnkleY = leftAnkle.visibility && rightAnkle.visibility &&
              leftAnkle.visibility > 0.5 && rightAnkle.visibility > 0.5 ? ((leftAnkle.y + rightAnkle.y) / 2) * canvas.height : 0;
            const totalHeight = avgAnkleY > 0 ? Math.abs(avgAnkleY - nose.y * canvas.height) : 0;

            const newMeasurements = {
              shoulders: Math.round(shoulderWidth * 0.5 * 10) / 10,
              neck: Math.round(neckLength * 0.5 * 10) / 10,
              leftArm: Math.round(leftArmLength * 0.5 * 10) / 10,
              rightArm: Math.round(rightArmLength * 0.5 * 10) / 10,
              chest: Math.round(chestWidth * 0.5 * 10) / 10,
              waist: Math.round(waistWidth * 0.5 * 10) / 10,
              hips: Math.round(hipWidth * 0.5 * 10) / 10,
              leftLeg: Math.round(leftLegLength * 0.5 * 10) / 10,
              rightLeg: Math.round(rightLegLength * 0.5 * 10) / 10,
              height: Math.round(totalHeight * 0.5 * 10) / 10,
            };

            setMeasurements(newMeasurements);
            setSizeRecommendation(recommendSize(newMeasurements));
            autoCaptureMeasurement(newMeasurements);
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(detect);
    };

    detect();
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // AI Fashion Designer Component
  const AIFashionDesigner = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Palette className="h-6 w-6 text-pink-600" />
            AI Fashion Designer
          </h2>
          <p className="text-muted-foreground mt-1">Create personalized fashion recommendations based on your measurements</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Design Canvas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Fashion Design Canvas
            </CardTitle>
            <CardDescription>
              Design your custom clothing with AI-powered tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  onClick={() => {
                    setCurrentDesign(null); // Reset for new design
                    // Design canvas will be rendered below
                  }}
                >
                  <Palette className="h-6 w-6" />
                  <span className="text-sm">Design Canvas</span>
                </Button>
                
                <Button 
                  className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                  onClick={() => {
                    // TODO: Open template gallery
                    toast.success('Template Gallery coming soon!');
                  }}
                >
                  <Shirt className="h-6 w-6" />
                  <span className="text-sm">Templates</span>
                </Button>
              </div>
              
              <div className="text-center py-4">
                <h4 className="font-medium mb-2">🎨 Design Features:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>• Drag & Drop Design</div>
                  <div>• Fabric Selection</div>
                  <div>• Color Customization</div>
                  <div>• Pattern Library</div>
                  <div>• Size Auto-Fit</div>
                  <div>• 3D Preview</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Style Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Suit Style Preferences
            </CardTitle>
            <CardDescription>
              Select your preferred suit styles for personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suitStyles.map((style) => (
                  <div
                    key={style.id}
                    className={`rounded-lg border-2 cursor-pointer transition-all duration-200 overflow-hidden ${
                      selectedSuitStyles.includes(style.id)
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                    }`}
                    onClick={() => toggleSuitStyle(style.id)}
                  >
                    {/* Image Section */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={style.image}
                        alt={style.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://via.placeholder.com/300x400/6366f1/ffffff?text=${encodeURIComponent(style.name)}`;
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <div className="text-2xl bg-white/80 rounded-full p-1">
                          {style.icon}
                        </div>
                      </div>
                      {selectedSuitStyles.includes(style.id) && (
                        <div className="absolute top-2 left-2">
                          <div className="bg-purple-600 text-white rounded-full p-1">
                            <Check className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Content Section */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-sm">{style.name}</h4>
                        {selectedSuitStyles.includes(style.id) && (
                          <Badge className="bg-purple-600 text-white text-xs">
                            Selected
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{style.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {style.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedSuitStyles.length > 0 && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">
                      Selected Styles ({selectedSuitStyles.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedSuitStyles.map((styleId) => {
                      const style = suitStyles.find(s => s.id === styleId);
                      return (
                        <Badge key={styleId} className="bg-purple-600 text-white">
                          {style?.icon} {style?.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                  💡 Select multiple styles to get comprehensive recommendations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Design Canvas - Show when user wants to design */}
      {capturedMeasurements && (
        <div className="mt-8">
          <DesignCanvas
            measurements={capturedMeasurements}
            onSave={(design) => {
              setCurrentDesign(design);
              toast.success('Design saved successfully!');
            }}
            onOrder={(design) => {
              setCurrentDesign(design);
              toast.success('Design ready for ordering!');
            }}
          />
        </div>
      )}

      {/* Cost Calculator - Show when design is ready */}
      {currentDesign && (
        <div className="mt-8">
          <CostCalculator
            templateId={currentDesign.template_id}
            fabricSelections={currentDesign.fabric_selections}
            measurements={currentDesign.measurements_data}
            onCostCalculated={(estimate) => {
              setCostEstimate(estimate);
            }}
          />
        </div>
      )}
    </div>
  );

  // Body Measurement Component
  const BodyMeasurementTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Camera className="h-6 w-6 text-purple-600" />
            Body Measurement
          </h2>
          <p className="text-muted-foreground mt-1">AI-powered body measurement for perfect fit</p>
        </div>
        <div className="flex items-center gap-2">
          {isModelLoading && (
            <Badge variant="secondary" className="animate-pulse">
              Loading AI Model...
            </Badge>
          )}
          {!isModelLoading && isCameraActive && (
            <Badge className="bg-green-500/20 text-green-700 border-green-500/50">
              ● Live Detection
            </Badge>
          )}
          {captureStatus === 'captured' && (
            <Badge className="bg-green-600 text-white animate-pulse">
              ✓ Measurements Captured!
            </Badge>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Camera Feed */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Camera Feed
            </CardTitle>
            <CardDescription>
              Position yourself within the detection frame for accurate measurements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover hidden"
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {!isCameraActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                      <Camera className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-muted-foreground">Camera is off</p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3 mt-4">
              <div className="flex gap-3">
                {!isCameraActive ? (
                  <Button
                    onClick={startCamera}
                    disabled={isModelLoading}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Start Camera
                  </Button>
                ) : (
                  <Button
                    onClick={stopCamera}
                    variant="secondary"
                    className="flex-1"
                  >
                    <CameraOff className="h-4 w-4 mr-2" />
                    Stop Camera
                  </Button>
                )}
              </div>
              {isCameraActive && (
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isAutoCaptureEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium">Auto Capture</span>
                  </div>
                  <Button
                    size="sm"
                    variant={isAutoCaptureEnabled ? "default" : "outline"}
                    onClick={() => setIsAutoCaptureEnabled(!isAutoCaptureEnabled)}
                  >
                    {isAutoCaptureEnabled ? 'ON' : 'OFF'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Measurements Panel */}
        <Card className="space-y-6">
          <CardContent className="pt-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Live Measurements</h2>
              <div className="space-y-3">
                {[
                  { label: 'Height', value: measurements.height, scale: 0.8 },
                  { label: 'Shoulders', value: measurements.shoulders, scale: 2 },
                  { label: 'Chest', value: measurements.chest, scale: 2 },
                  { label: 'Waist', value: measurements.waist, scale: 2.5 },
                  { label: 'Hips', value: measurements.hips, scale: 2.5 },
                  { label: 'Left Arm', value: measurements.leftArm, scale: 1.5 },
                  { label: 'Right Arm', value: measurements.rightArm, scale: 1.5 },
                  { label: 'Left Leg', value: measurements.leftLeg, scale: 1.2 },
                  { label: 'Right Leg', value: measurements.rightLeg, scale: 1.2 },
                ].map(({ label, value, scale }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className="text-lg font-semibold text-primary">{value}</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                        style={{ width: `${Math.min(value * scale, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h2 className="text-xl font-semibold mb-4">Size Recommendation</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <span className="text-sm font-medium">Top Size</span>
                  <Badge className="text-lg font-bold">{sizeRecommendation.top}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <span className="text-sm font-medium">Bottom Size</span>
                  <Badge className="text-lg font-bold">{sizeRecommendation.bottom}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <span className="text-sm font-medium">Confidence</span>
                  <Badge
                    variant={sizeRecommendation.confidence === 'high' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {sizeRecommendation.confidence}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Captured Measurements Section */}
            {capturedMeasurements && (
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Captured Measurements
                </h3>
                <div className="space-y-2">
                  {[
                    { label: 'Height', value: capturedMeasurements.height },
                    { label: 'Chest', value: capturedMeasurements.chest },
                    { label: 'Waist', value: capturedMeasurements.waist },
                    { label: 'Shoulders', value: capturedMeasurements.shoulders },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}:</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => saveMeasurementsToDatabase(capturedMeasurements, sizeRecommendation)}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save to Database
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCapturedMeasurements(null)}
                  >
                    Clear Data
                  </Button>
                </div>
              </div>
            )}

            {/* Measurement History Section */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Measurement History
              </h3>
              {isLoadingHistory ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Loading history...</p>
                </div>
              ) : measurementHistory.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {measurementHistory.slice(0, 3).map((measurement, index) => (
                    <div key={measurement.id} className="p-2 bg-secondary rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {new Date(measurement.measurement_date || measurement.created_at || '').toLocaleDateString()}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {measurement.recommended_top_size}/{measurement.recommended_bottom_size}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Height: {measurement.height} • Chest: {measurement.chest} • Waist: {measurement.waist}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No measurements saved yet</p>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="pt-4 border-t">
              <div className="text-xs text-muted-foreground space-y-2">
                <p><strong>💡 Auto-Capture Tips:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Stand within the green detection frame</li>
                  <li>Keep all body parts visible</li>
                  <li>Hold steady pose for 2-3 seconds</li>
                  <li>Green frame = ready to capture</li>
                  <li>Orange frame = adjust position</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-8 w-8 text-purple-600" />
            Tailor AI
          </h1>
          <p className="text-muted-foreground mt-1">AI-powered body measurement and fashion design</p>
        </div>
        {costEstimate && (
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Estimated Cost</div>
            <div className="text-2xl font-bold text-green-600">
              ${costEstimate.total_cost.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {costEstimate.estimated_delivery_days} days delivery
            </div>
          </div>
        )}
      </div>

      <Tabs defaultValue="measurement" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="measurement" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Body Measurement
          </TabsTrigger>
          <TabsTrigger value="fashion" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            AI Fashion Designer
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="measurement" className="mt-6">
          <BodyMeasurementTab />
        </TabsContent>
        
        <TabsContent value="fashion" className="mt-6">
          <AIFashionDesigner />
        </TabsContent>
      </Tabs>
    </div>
  );
}
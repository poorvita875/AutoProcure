"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Link, Zap, Hexagon } from "lucide-react";
import { motion } from "framer-motion";
import NextLink from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlowingEdgeCard } from "@/components/GlowingEdgeCard";

export interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  href?: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
}

export default function RadialOrbitalTimeline({
  timelineData,
}: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
    {}
  );
  const [viewMode, setViewMode] = useState<"orbital">("orbital");
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [centerOffset, setCenterOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (parseInt(key) !== id) {
          newState[parseInt(key)] = false;
        }
      });

      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);

        const relatedItems = getRelatedItems(id);
        const newPulseEffect: Record<number, boolean> = {};
        relatedItems.forEach((relId) => {
          newPulseEffect[relId] = true;
        });
        setPulseEffect(newPulseEffect);

        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  useEffect(() => {
    let rotationTimer: NodeJS.Timeout;

    if (autoRotate && viewMode === "orbital") {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => {
          const newAngle = (prev + 0.3) % 360;
          return Number(newAngle.toFixed(3));
        });
      }, 50);
    }

    return () => {
      if (rotationTimer) {
        clearInterval(rotationTimer);
      }
    };
  }, [autoRotate, viewMode]);

  const centerViewOnNode = (nodeId: number) => {
    if (viewMode !== "orbital" || !nodeRefs.current[nodeId]) return;

    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;

    setRotationAngle(270 - targetAngle);
  };

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 200;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian) + centerOffset.x;
    const y = radius * Math.sin(radian) + centerOffset.y;

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(
      0.4,
      Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2))
    );

    return { x, y, angle, zIndex, opacity };
  };

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    const relatedItems = getRelatedItems(activeNodeId);
    return relatedItems.includes(itemId);
  };

  const getStatusStyles = (status: TimelineItem["status"]): string => {
    switch (status) {
      case "completed":
        return "text-white bg-black border-white";
      case "in-progress":
        return "text-black bg-white border-black";
      case "pending":
        return "text-white bg-black/40 border-white/50";
      default:
        return "text-white bg-black/40 border-white/50";
    }
  };

  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-center bg-black overflow-hidden"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
          style={{
            perspective: "1000px",
            transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
          }}
        >
          <div className="absolute flex items-center justify-center z-10">
            {/* Core Glow Background */}
            <div className="absolute w-20 h-20 rounded-full bg-blue-500/10 blur-2xl animate-pulse"></div>

            {/* Rotating Outer Ring */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute w-28 h-28 border border-dashed border-blue-400/20 rounded-full"
            />

            {/* Floating Core Container */}
            <motion.div
              animate={{ 
                y: [0, -6, 0],
                rotate: [0, 3, 0, -3, 0]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity, 
                ease: "easeInOut"
              }}
              className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-white/10 to-blue-500/10 border border-white/20 flex items-center justify-center backdrop-blur-xl shadow-[0_0_30px_rgba(59,130,246,0.3)] relative z-10"
            >
              <Hexagon className="text-white w-7 h-7 filter drop-shadow-[0_0_10px_rgba(96,165,250,1)] relative z-20" />
            </motion.div>

            {/* Subtle Expanding Pings */}
            <motion.div 
              animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
              className="absolute w-20 h-20 border border-blue-400/30 rounded-full"
            />
          </div>

          <div className="absolute w-96 h-96 rounded-full border border-white/10"></div>

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;

            const nodeStyle = {
              transform: `translate(${position.x}px, ${position.y}px)`,
              zIndex: isExpanded ? 200 : position.zIndex,
              opacity: isExpanded ? 1 : position.opacity,
            };

            return (
              <div
                key={item.id}
                ref={(el) => (nodeRefs.current[item.id] = el)}
                className="absolute transition-all duration-700 cursor-pointer"
                style={nodeStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                <div
                  className={`absolute rounded-full -inset-1 ${
                    isPulsing ? "animate-pulse duration-1000" : ""
                  }`}
                  style={{
                    background: `radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)`,
                    width: `${item.energy * 0.5 + 40}px`,
                    height: `${item.energy * 0.5 + 40}px`,
                    left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                    top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                  }}
                ></div>

                <div
                  className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${
                    isExpanded
                      ? "bg-white text-black shadow-2xl shadow-white/60"
                      : isRelated
                      ? "bg-white text-black shadow-lg shadow-white/60"
                      : "bg-white/20 text-white shadow-lg shadow-white/30"
                  }
                  border-2 
                  ${
                    isExpanded
                      ? "border-white shadow-lg shadow-white/50"
                      : isRelated
                      ? "border-white animate-pulse"
                      : "border-white/90"
                  }
                  transition-all duration-300 transform
                  ${isExpanded ? "scale-150" : "hover:scale-110 hover:border-white hover:shadow-white/40"}
                `}
                >
                  <Icon size={20} className={isExpanded ? "text-black" : "drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"} />
                </div>

                <div
                  className={`
                  absolute top-12  whitespace-nowrap
                  text-xs font-semibold tracking-wider
                  transition-all duration-300
                  ${isExpanded ? "opacity-0 scale-90" : "opacity-100 text-white/70"}
                `}
                >
                  {item.title}
                </div>

                {isExpanded && (
                  <div className="absolute top-20 left-1/2 -translate-x-1/2 w-72 z-50">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-white/50 z-0"></div>
                    <GlowingEdgeCard mode="dark" className="w-full h-auto min-h-[200px] shadow-xl shadow-white/5">
                      <div className="flex flex-col p-5 relative z-20 h-full text-left">
                        
                        <div className="pb-2 mb-2">
                          <h3 className="text-lg font-bold text-white tracking-wide">
                            {item.title}
                          </h3>
                        </div>
                        
                        <div className="text-xs text-white/80 leading-relaxed">
                          <p>{item.content}</p>

                          <div className="mt-4 pt-3 border-t border-white/10">
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="flex items-center">
                                <Zap size={10} className="mr-1 text-yellow-400" />
                                Energy Level
                              </span>
                              <span className="font-mono text-white/90">{item.energy}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                style={{ width: `${item.energy}%` }}
                              ></div>
                            </div>
                          </div>

                          {item.relatedIds.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-white/10">
                              <div className="flex items-center mb-2">
                                <Link size={10} className="text-white/70 mr-1" />
                                <h4 className="text-[10px] uppercase tracking-wider font-medium text-white/60">
                                  Connected Nodes
                                </h4>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {item.relatedIds.map((relatedId) => {
                                  const relatedItem = timelineData.find(
                                    (i) => i.id === relatedId
                                  );
                                  return (
                                    <Button
                                      key={relatedId}
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center h-6 px-2 py-0 text-[10px] rounded border-white/20 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-all backdrop-blur-sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleItem(relatedId);
                                      }}
                                    >
                                      {relatedItem?.title}
                                      <ArrowRight
                                        size={8}
                                        className="ml-1 text-white/60"
                                      />
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {item.href && (
                            <div className="mt-5 pt-4 border-t border-white/10">
                              <NextLink href={item.href} passHref>
                                <button className="w-full relative group overflow-hidden rounded-lg bg-white text-black font-semibold h-9 text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                  <span className="relative z-10 flex items-center justify-center">
                                    Launch {item.title}
                                    <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                  </span>
                                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-purple-100 to-teal-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </button>
                              </NextLink>
                            </div>
                          )}
                        </div>
                      </div>
                    </GlowingEdgeCard>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

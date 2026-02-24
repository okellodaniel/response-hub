import { useEffect, useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, X, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useGeneralNews } from '@/contexts/GeneralNewsContext';
import { format } from 'date-fns';
import { adverseNewsApi, type GeneralNewsDetailResponse, type GeneralNewsSearchDetailResponse } from '@/integrations/adverse-news-api/client';
import LoadingSpinner from './LoadingSpinner';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

const GeneralNewsDetailsSheet = () => {
  const { selectedRecord, setSelectedRecord } = useGeneralNews();
  const [searchDetail, setSearchDetail] = useState<GeneralNewsSearchDetailResponse | null>(null);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const currentImageUrlRef = useRef<string | null>(null);

  const currentResult: GeneralNewsDetailResponse | null = searchDetail?.results?.[currentResultIndex] ?? null;
  const totalResults = searchDetail?.results?.length ?? 0;

  useEffect(() => {
    if (selectedRecord) {
      const fetchDetails = async () => {
        setLoading(true);
        setCurrentResultIndex(0);
        try {
          const data = await adverseNewsApi.getGeneralNewsSearchById(selectedRecord.id);
          setSearchDetail(data);
        } catch (error) {
          console.error('Failed to fetch general news details:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    } else {
      setSearchDetail(null);
      setImageUrl(null);
    }
  }, [selectedRecord]);

  useEffect(() => {
    if (currentResult?.image_id) {
      const fetchImage = async () => {
        setImageLoading(true);
        setImageError(null);
        try {
          const url = await adverseNewsApi.getImageById(currentResult.image_id);
          if (currentImageUrlRef.current) URL.revokeObjectURL(currentImageUrlRef.current);
          currentImageUrlRef.current = url;
          setImageUrl(url);
        } catch (error) {
          console.error('Failed to fetch image:', error);
          setImageError('Failed to load image.');
          setImageUrl(null);
          if (currentImageUrlRef.current) {
            URL.revokeObjectURL(currentImageUrlRef.current);
            currentImageUrlRef.current = null;
          }
        } finally {
          setImageLoading(false);
        }
      };
      fetchImage();
    } else {
      if (currentImageUrlRef.current) {
        URL.revokeObjectURL(currentImageUrlRef.current);
        currentImageUrlRef.current = null;
      }
      setImageUrl(null);
      setImageError(null);
    }
  }, [currentResult]);

  useEffect(() => {
    return () => {
      if (currentImageUrlRef.current) {
        URL.revokeObjectURL(currentImageUrlRef.current);
        currentImageUrlRef.current = null;
      }
    };
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(5, prev + delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleZoomIn = useCallback(() => setZoom(prev => Math.min(5, prev + 0.25)), []);
  const handleZoomOut = useCallback(() => setZoom(prev => Math.max(0.5, prev - 0.25)), []);
  const handleReset = useCallback(() => { setZoom(1); setPosition({ x: 0, y: 0 }); }, []);

  useEffect(() => {
    if (!isImageExpanded) { setZoom(1); setPosition({ x: 0, y: 0 }); }
  }, [isImageExpanded]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!selectedRecord) return null;

  return (
    <Sheet open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
      <SheetContent className="sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>General News Details</SheetTitle>
          <SheetDescription>Full information for this general news search.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Search metadata */}
          <div className="p-4 bg-muted rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Search ID</span>
              <span className="text-sm font-mono">{selectedRecord.id.slice(0, 8)}...</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Query</span>
              <span className="text-sm font-medium">{selectedRecord.query}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Results Found</span>
              <span className="text-sm">{selectedRecord.resultsCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Created At</span>
              <span className="text-sm">{format(new Date(selectedRecord.createdAt), 'PPp')}</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : searchDetail && currentResult ? (
            <>
              {/* Article Navigation */}
              {totalResults > 1 && (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentResultIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentResultIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      Article {currentResultIndex + 1} of {totalResults}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentResultIndex(prev => Math.min(totalResults - 1, prev + 1))}
                      disabled={currentResultIndex === totalResults - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground truncate max-w-xs">
                    {currentResult.headline || 'No headline'}
                  </div>
                </div>
              )}

              {/* Article Overview */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Article Overview</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg col-span-2">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Headline</span>
                    <p className="mt-1 font-medium">{currentResult.headline || '—'}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Primary Topic</span>
                    <p className="mt-1 font-medium">{currentResult.primary_topic || '—'}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Overall Sentiment</span>
                    <p className="mt-1 font-medium">{currentResult.overall_sentiment || '—'}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">News Type</span>
                    <p className="mt-1 font-medium">{currentResult.news_type || '—'}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Geographic Scope</span>
                    <p className="mt-1 font-medium">{currentResult.geographic_scope || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Newspaper Metadata */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Publication Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Newspaper</span>
                    <p className="mt-1 font-medium">
                      {currentResult.newspaper_metadata?.newspaper_name ?? currentResult.newspaper_name ?? '—'}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Date</span>
                    <p className="mt-1 font-medium">
                      {currentResult.newspaper_metadata?.date ?? currentResult.created_at?.split('T')[0] ?? '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* General Summary */}
              {currentResult.general_summary && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Summary</h4>
                  <div className="p-4 border rounded-lg space-y-3">
                    {currentResult.general_summary.brief_summary && (
                      <div>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Brief Summary</span>
                        <p className="mt-1">{currentResult.general_summary.brief_summary}</p>
                      </div>
                    )}
                    {currentResult.general_summary.key_takeaways && currentResult.general_summary.key_takeaways.length > 0 && (
                      <div>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Key Takeaways</span>
                        <ul className="mt-1 list-disc list-inside space-y-1">
                          {currentResult.general_summary.key_takeaways.map((t, i) => (
                            <li key={i} className="text-sm">{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Article Classification */}
              {currentResult.article_classification && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Article Classification</h4>
                  <div className="p-4 border rounded-lg space-y-3">
                    {currentResult.article_classification.secondary_topics && currentResult.article_classification.secondary_topics.length > 0 && (
                      <div>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Secondary Topics</span>
                        <p className="mt-1">{currentResult.article_classification.secondary_topics.join(', ')}</p>
                      </div>
                    )}
                    {currentResult.article_classification.sentiment_explanation && (
                      <div>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Sentiment Explanation</span>
                        <p className="mt-1">{currentResult.article_classification.sentiment_explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Key Information */}
              {currentResult.key_information && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Key Information</h4>
                  <div className="p-4 border rounded-lg space-y-3">
                    {currentResult.key_information.primary_subject && (
                      <div>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Primary Subject</span>
                        <p className="mt-1 font-medium">{currentResult.key_information.primary_subject}</p>
                      </div>
                    )}
                    {currentResult.key_information.key_facts && currentResult.key_information.key_facts.length > 0 && (
                      <div>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Key Facts</span>
                        <ul className="mt-1 list-disc list-inside space-y-1">
                          {currentResult.key_information.key_facts.map((f, i) => (
                            <li key={i} className="text-sm">{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {currentResult.key_information.key_events && currentResult.key_information.key_events.length > 0 && (
                      <div>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Key Events</span>
                        <ul className="mt-1 list-disc list-inside space-y-1">
                          {currentResult.key_information.key_events.map((e, i) => (
                            <li key={i} className="text-sm">{e}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {currentResult.key_information.timeline && (
                      <div>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Timeline</span>
                        <p className="mt-1">{currentResult.key_information.timeline}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Outcomes & Implications */}
              {currentResult.outcomes_and_implications && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Outcomes & Implications</h4>
                  <div className="p-4 border rounded-lg space-y-3">
                    {currentResult.outcomes_and_implications.stated_outcomes && (
                      <div>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Stated Outcomes</span>
                        <p className="mt-1">{currentResult.outcomes_and_implications.stated_outcomes}</p>
                      </div>
                    )}
                    {currentResult.outcomes_and_implications.projected_outcomes && (
                      <div>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Projected Outcomes</span>
                        <p className="mt-1">{currentResult.outcomes_and_implications.projected_outcomes}</p>
                      </div>
                    )}
                    {currentResult.outcomes_and_implications.affected_parties && (
                      <div>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Affected Parties</span>
                        <p className="mt-1">{currentResult.outcomes_and_implications.affected_parties}</p>
                      </div>
                    )}
                    {currentResult.outcomes_and_implications.stakeholder_reactions && (
                      <div>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Stakeholder Reactions</span>
                        <p className="mt-1">{currentResult.outcomes_and_implications.stakeholder_reactions}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Article Image */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Article Image</h4>
                {imageLoading ? (
                  <div className="flex justify-center p-8 border rounded-lg">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : imageError ? (
                  <div className="p-8 border rounded-lg text-center">
                    <p className="text-destructive mb-2">{imageError}</p>
                  </div>
                ) : imageUrl ? (
                  <div
                    className="border rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setIsImageExpanded(true)}
                  >
                    <img
                      src={imageUrl}
                      alt="Article scan"
                      className="w-full h-auto max-h-96 object-contain"
                      onError={() => {
                        setImageError('Failed to load image.');
                        if (currentImageUrlRef.current) {
                          URL.revokeObjectURL(currentImageUrlRef.current);
                          currentImageUrlRef.current = null;
                        }
                        setImageUrl(null);
                      }}
                    />
                  </div>
                ) : (
                  <div className="p-8 border rounded-lg text-center text-muted-foreground">
                    No image available for this article.
                  </div>
                )}
              </div>
            </>
          ) : !loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Unable to load detailed record.
            </div>
          ) : null}
        </div>
      </SheetContent>

      {/* Fullscreen image dialog */}
      <Dialog open={isImageExpanded} onOpenChange={setIsImageExpanded}>
        <DialogContent className="max-w-[98vw] max-h-[98vh] w-[98vw] h-[98vh] p-0 bg-black/95 border-0 overflow-hidden">
          {imageUrl ? (
            <>
              <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white">
                <div className="flex items-center gap-2">
                  <button onClick={handleZoomOut} className="p-2 hover:bg-white/20 rounded transition-colors" disabled={zoom <= 0.5}>
                    <ZoomOut size={20} />
                  </button>
                  <span className="text-sm font-medium min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
                  <button onClick={handleZoomIn} className="p-2 hover:bg-white/20 rounded transition-colors" disabled={zoom >= 5}>
                    <ZoomIn size={20} />
                  </button>
                  <button onClick={handleReset} className="p-2 hover:bg-white/20 rounded ml-2 transition-colors">
                    <Maximize2 size={20} />
                  </button>
                </div>
                <button onClick={() => setIsImageExpanded(false)} className="p-2 hover:bg-white/20 rounded ml-4 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div
                ref={containerRef}
                className="w-full h-full overflow-hidden relative flex items-center justify-center p-4"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
              >
                <div
                  className="absolute"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease',
                    cursor: isDragging ? 'grabbing' : 'grab',
                  }}
                >
                  <img src={imageUrl} alt="Article scan (expanded)" className="max-w-full max-h-full object-contain shadow-2xl" />
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-white">
              <X size={48} className="mb-4 text-destructive" />
              <h3 className="text-xl font-semibold mb-2">Image Not Available</h3>
              <button onClick={() => setIsImageExpanded(false)} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded transition-colors mt-4">
                Close
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Sheet>
  );
};

export default GeneralNewsDetailsSheet;

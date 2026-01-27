import { useEffect, useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, X, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSearch } from '@/contexts/SearchContext';
import { format } from 'date-fns';
import { adverseNewsApi, type ApiSearchItem, type SearchResultResponse } from '@/integrations/adverse-news-api/client';
import LoadingSpinner from './LoadingSpinner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface NewspaperMetadata {
  newspaper_name: string | null;
  date: string | null;
  page_number: number | null;
  section: string | null;
}

interface KeyAdverseOutcomes {
  primary_impact?: string;
  secondary_effects?: string;
  affected_parties?: string;
  legal_consequences?: string;
}

interface RiskScoring {
  reputational_risk_score?: number;
  legal_risk_score?: number;
}

interface RiskAssessment {
  reputational_risk?: { score: string; reason: string };
  operational_risk?: { score: string; reason: string };
  regulatory_risk?: { score: string; reason: string };
}

interface Summary {
  brief_summary?: string;
  key_facts?: string[];
  timeline?: string;
}

const RecordDetailsSheet = () => {
  const { selectedRecord, setSelectedRecord } = useSearch();
  const [searchResult, setSearchResult] = useState<SearchResultResponse | null>(null);
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

  const currentResult = searchResult?.results?.[currentResultIndex] || null;
  const totalResults = searchResult?.results?.length || 0;

  useEffect(() => {
    if (selectedRecord) {
      const fetchDetails = async () => {
        setLoading(true);
        setCurrentResultIndex(0);
        try {
          const data = await adverseNewsApi.getSearchResultById(selectedRecord.id);
          setSearchResult(data);
        } catch (error) {
          console.error('Failed to fetch record details:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    } else {
      setSearchResult(null);
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

          // Clean up previous image URL if it exists
          if (currentImageUrlRef.current) {
            URL.revokeObjectURL(currentImageUrlRef.current);
          }

          currentImageUrlRef.current = url;
          setImageUrl(url);
        } catch (error) {
          console.error('Failed to fetch image:', error);
          setImageError('Failed to load image. The image may not be available.');
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
      // Clean up if no image_id
      if (currentImageUrlRef.current) {
        URL.revokeObjectURL(currentImageUrlRef.current);
        currentImageUrlRef.current = null;
      }
      setImageUrl(null);
      setImageError(null);
    }
  }, [currentResult]);

  // Cleanup image URL on component unmount
  useEffect(() => {
    return () => {
      if (currentImageUrlRef.current) {
        URL.revokeObjectURL(currentImageUrlRef.current);
        currentImageUrlRef.current = null;
      }
    };
  }, []);

  // Zoom and drag handlers
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.5, Math.min(5, prev + delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(5, prev + 0.25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(0.5, prev - 0.25));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Reset zoom and position when dialog closes
  useEffect(() => {
    if (!isImageExpanded) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isImageExpanded]);

  // Attach global mouse move and up listeners
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

  const statusColors = {
    pending: 'bg-warning text-warning-foreground',
    completed: 'bg-success text-success-foreground',
    error: 'bg-destructive text-destructive-foreground',
  };

  return (
    <Sheet open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
      <SheetContent className="sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Record Details</SheetTitle>
          <SheetDescription>
            Full information for this search record.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="p-4 bg-muted rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Status</span>
              <Badge className={statusColors[selectedRecord.status]}>
                {selectedRecord.status.charAt(0).toUpperCase() + selectedRecord.status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Record ID</span>
              <span className="text-sm font-mono">{selectedRecord.id.slice(0, 8)}...</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Created At</span>
              <span className="text-sm">
                {format(new Date(selectedRecord.createdAt), 'PPp')}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Search Parameters</h4>
            <div className="grid gap-4">
              <div className="p-4 border rounded-lg">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Name</span>
                <p className="mt-1 font-medium">{selectedRecord.names}</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : searchResult && currentResult ? (
            <>
              {/* Carousel Navigation */}
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
                  <div className="text-sm text-muted-foreground">
                    {currentResult.headline || 'No headline'}
                  </div>
                </div>
              )}

              {/* Category & Adverse News Classification */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Adverse News Classification</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Category</span>
                    <p className="mt-1 font-medium">{currentResult.category || '—'}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Severity Level</span>
                    <p className="mt-1 font-medium">{currentResult.severity_level || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Newspaper Metadata */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Newspaper Metadata</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Newspaper Name</span>
                    <p className="mt-1 font-medium">
                      {typeof currentResult.newspaper_metadata === 'object' && currentResult.newspaper_metadata !== null
                        ? (currentResult.newspaper_metadata as NewspaperMetadata).newspaper_name || '—'
                        : currentResult.newspaper_name || '—'}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Date</span>
                    <p className="mt-1 font-medium">
                      {typeof currentResult.newspaper_metadata === 'object' && currentResult.newspaper_metadata !== null
                        ? (currentResult.newspaper_metadata as NewspaperMetadata).date || '—'
                        : currentResult.created_at?.split('T')[0] || '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Article Summary */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Article Summary</h4>
                <div className="p-4 border rounded-lg">
                  {currentResult.summary && typeof currentResult.summary === 'object' ? (
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Brief Summary</span>
                        <p className="mt-1 font-medium">{(currentResult.summary as Summary).brief_summary || '—'}</p>
                      </div>
                      {(currentResult.summary as Summary).key_facts && (
                        <div>
                          <span className="text-xs uppercase tracking-wide text-muted-foreground">Key Facts</span>
                          <ul className="mt-1 list-disc list-inside space-y-1">
                            {(currentResult.summary as Summary).key_facts!.map((fact, idx) => (
                              <li key={idx} className="text-sm">{fact}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Timeline</span>
                        <p className="mt-1 font-medium">{(currentResult.summary as Summary).timeline || '—'}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No summary data available.</p>
                  )}
                </div>
              </div>

              {/* Key Adverse Outcomes */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Key Adverse Outcomes</h4>
                <div className="p-4 border rounded-lg">
                  {currentResult.key_adverse_outcomes && typeof currentResult.key_adverse_outcomes === 'object' ? (
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Primary Impact</span>
                        <p className="mt-1 font-medium">{(currentResult.key_adverse_outcomes as KeyAdverseOutcomes).primary_impact || '—'}</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Secondary Effects</span>
                        <p className="mt-1 font-medium">{(currentResult.key_adverse_outcomes as KeyAdverseOutcomes).secondary_effects || '—'}</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Affected Parties</span>
                        <p className="mt-1 font-medium">{(currentResult.key_adverse_outcomes as KeyAdverseOutcomes).affected_parties || '—'}</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Legal Consequences</span>
                        <p className="mt-1 font-medium">{(currentResult.key_adverse_outcomes as KeyAdverseOutcomes).legal_consequences || '—'}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No adverse outcomes data available.</p>
                  )}
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Risk Assessment</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Reputational Risk</span>
                    <p className="mt-1 font-medium">
                      {currentResult.risk_assessment && typeof currentResult.risk_assessment === 'object'
                        ? (currentResult.risk_assessment as RiskAssessment).reputational_risk?.score || '—'
                        : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {currentResult.risk_assessment && typeof currentResult.risk_assessment === 'object'
                        ? (currentResult.risk_assessment as RiskAssessment).reputational_risk?.reason || ''
                        : ''}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Operational Risk</span>
                    <p className="mt-1 font-medium">
                      {currentResult.risk_assessment && typeof currentResult.risk_assessment === 'object'
                        ? (currentResult.risk_assessment as RiskAssessment).operational_risk?.score || '—'
                        : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {currentResult.risk_assessment && typeof currentResult.risk_assessment === 'object'
                        ? (currentResult.risk_assessment as RiskAssessment).operational_risk?.reason || ''
                        : ''}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Regulatory Risk</span>
                    <p className="mt-1 font-medium">
                      {currentResult.risk_assessment && typeof currentResult.risk_assessment === 'object'
                        ? (currentResult.risk_assessment as RiskAssessment).regulatory_risk?.score || '—'
                        : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {currentResult.risk_assessment && typeof currentResult.risk_assessment === 'object'
                        ? (currentResult.risk_assessment as RiskAssessment).regulatory_risk?.reason || ''
                        : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk Scoring */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Risk Scoring</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Overall Risk Score</span>
                    <p className="mt-1 font-medium">{currentResult.overall_risk_score ?? '—'}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Priority Level</span>
                    <p className="mt-1 font-medium">{currentResult.priority_level || '—'}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Reputational Risk Score</span>
                    <p className="mt-1 font-medium">
                      {currentResult.risk_scoring && typeof currentResult.risk_scoring === 'object'
                        ? (currentResult.risk_scoring as RiskScoring).reputational_risk_score ?? '—'
                        : '—'}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Legal Risk Score</span>
                    <p className="mt-1 font-medium">
                      {currentResult.risk_scoring && typeof currentResult.risk_scoring === 'object'
                        ? (currentResult.risk_scoring as RiskScoring).legal_risk_score ?? '—'
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>

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
                    <p className="text-sm text-muted-foreground">The image could not be loaded.</p>
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
                        setImageError('Failed to load image. The image may be corrupted.');
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Unable to load detailed record.
            </div>
          )}
        </div>
      </SheetContent>
      <Dialog open={isImageExpanded} onOpenChange={setIsImageExpanded}>
        <DialogContent className="max-w-[98vw] max-h-[98vh] w-[98vw] h-[98vh] p-0 bg-black/95 border-0 overflow-hidden">
          {imageUrl ? (
            <>
              {/* Toolbar */}
              <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleZoomOut}
                    className="p-2 hover:bg-white/20 rounded transition-colors"
                    aria-label="Zoom out"
                    disabled={zoom <= 0.5}
                  >
                    <ZoomOut size={20} />
                  </button>
                  <span className="text-sm font-medium min-w-[60px] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 hover:bg-white/20 rounded transition-colors"
                    aria-label="Zoom in"
                    disabled={zoom >= 5}
                  >
                    <ZoomIn size={20} />
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-2 hover:bg-white/20 rounded ml-2 transition-colors"
                    aria-label="Reset zoom"
                  >
                    <Maximize2 size={20} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/70 hidden sm:inline">
                    Drag to pan • Scroll to zoom • Click buttons or use mouse wheel
                  </span>
                  <button
                    onClick={() => setIsImageExpanded(false)}
                    className="p-2 hover:bg-white/20 rounded ml-4 transition-colors"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              {/* Image container */}
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
                  <img
                    src={imageUrl}
                    alt="Article scan (expanded)"
                    className="max-w-full max-h-full object-contain shadow-2xl"
                    onError={() => {
                      setIsImageExpanded(false);
                      setImageError('Failed to load image. The image may be corrupted.');
                      if (currentImageUrlRef.current) {
                        URL.revokeObjectURL(currentImageUrlRef.current);
                        currentImageUrlRef.current = null;
                      }
                      setImageUrl(null);
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-white">
              <X size={48} className="mb-4 text-destructive" />
              <h3 className="text-xl font-semibold mb-2">Image Not Available</h3>
              <p className="text-white/70 text-center mb-6">
                {imageError || 'The image could not be loaded or is no longer available.'}
              </p>
              <button
                onClick={() => setIsImageExpanded(false)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Sheet>
  );
};

export default RecordDetailsSheet;

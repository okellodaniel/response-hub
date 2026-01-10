import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useSearch } from '@/contexts/SearchContext';
import { format } from 'date-fns';
import { adverseNewsApi, type ApiSearchItem } from '@/integrations/adverse-news-api/client';
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

const RecordDetailsSheet = () => {
  const { selectedRecord, setSelectedRecord } = useSearch();
  const [detailedRecord, setDetailedRecord] = useState<ApiSearchItem | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  useEffect(() => {
    if (selectedRecord) {
      const fetchDetails = async () => {
        setLoading(true);
        try {
          const data = await adverseNewsApi.getSearchResultById(selectedRecord.id);
          setDetailedRecord(data);
        } catch (error) {
          console.error('Failed to fetch record details:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    } else {
      setDetailedRecord(null);
      setImageUrl(null);
    }
  }, [selectedRecord]);

  useEffect(() => {
    if (detailedRecord?.image_id) {
      const fetchImage = async () => {
        setImageLoading(true);
        try {
          const url = await adverseNewsApi.getImageById(detailedRecord.image_id);
          setImageUrl(url);
        } catch (error) {
          console.error('Failed to fetch image:', error);
          setImageUrl(null);
        } finally {
          setImageLoading(false);
        }
      };
      fetchImage();
    } else {
      setImageUrl(null);
    }
  }, [detailedRecord]);

  // Cleanup image URL on unmount
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  if (!selectedRecord) return null;

  const statusColors = {
    pending: 'bg-warning text-warning-foreground',
    completed: 'bg-success text-success-foreground',
    error: 'bg-destructive text-destructive-foreground',
  };

  return (
    <Sheet open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
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
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Surname</span>
                <p className="mt-1 font-medium">{selectedRecord.surname}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Given Name</span>
                <p className="mt-1 font-medium">{selectedRecord.givenName}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Other Name</span>
                <p className="mt-1 font-medium">{selectedRecord.otherName || '—'}</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : detailedRecord ? (
            <>
              {/* Category & Adverse News Classification */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Adverse News Classification</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Category</span>
                    <p className="mt-1 font-medium">{detailedRecord.category || '—'}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Severity Level</span>
                    <p className="mt-1 font-medium">{detailedRecord.severity_level || '—'}</p>
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
                      {typeof detailedRecord.newspaper_metadata === 'object' && detailedRecord.newspaper_metadata !== null
                        ? (detailedRecord.newspaper_metadata as NewspaperMetadata).newspaper_name || '—'
                        : detailedRecord.newspaper_name || '—'}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Date</span>
                    <p className="mt-1 font-medium">
                      {typeof detailedRecord.newspaper_metadata === 'object' && detailedRecord.newspaper_metadata !== null
                        ? (detailedRecord.newspaper_metadata as NewspaperMetadata).date || '—'
                        : detailedRecord.created_at?.split('T')[0] || '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Adverse Outcomes */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Key Adverse Outcomes</h4>
                <div className="p-4 border rounded-lg">
                  {detailedRecord.key_adverse_outcomes && typeof detailedRecord.key_adverse_outcomes === 'object' ? (
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Primary Impact</span>
                        <p className="mt-1 font-medium">{(detailedRecord.key_adverse_outcomes as KeyAdverseOutcomes).primary_impact || '—'}</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Secondary Effects</span>
                        <p className="mt-1 font-medium">{(detailedRecord.key_adverse_outcomes as KeyAdverseOutcomes).secondary_effects || '—'}</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Affected Parties</span>
                        <p className="mt-1 font-medium">{(detailedRecord.key_adverse_outcomes as KeyAdverseOutcomes).affected_parties || '—'}</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Legal Consequences</span>
                        <p className="mt-1 font-medium">{(detailedRecord.key_adverse_outcomes as KeyAdverseOutcomes).legal_consequences || '—'}</p>
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
                      {detailedRecord.risk_assessment && typeof detailedRecord.risk_assessment === 'object'
                        ? (detailedRecord.risk_assessment as RiskAssessment).reputational_risk?.score || '—'
                        : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {detailedRecord.risk_assessment && typeof detailedRecord.risk_assessment === 'object'
                        ? (detailedRecord.risk_assessment as RiskAssessment).reputational_risk?.reason || ''
                        : ''}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Operational Risk</span>
                    <p className="mt-1 font-medium">
                      {detailedRecord.risk_assessment && typeof detailedRecord.risk_assessment === 'object'
                        ? (detailedRecord.risk_assessment as RiskAssessment).operational_risk?.score || '—'
                        : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {detailedRecord.risk_assessment && typeof detailedRecord.risk_assessment === 'object'
                        ? (detailedRecord.risk_assessment as RiskAssessment).operational_risk?.reason || ''
                        : ''}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Regulatory Risk</span>
                    <p className="mt-1 font-medium">
                      {detailedRecord.risk_assessment && typeof detailedRecord.risk_assessment === 'object'
                        ? (detailedRecord.risk_assessment as RiskAssessment).regulatory_risk?.score || '—'
                        : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {detailedRecord.risk_assessment && typeof detailedRecord.risk_assessment === 'object'
                        ? (detailedRecord.risk_assessment as RiskAssessment).regulatory_risk?.reason || ''
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
                    <p className="mt-1 font-medium">{detailedRecord.overall_risk_score ?? '—'}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Priority Level</span>
                    <p className="mt-1 font-medium">{detailedRecord.priority_level || '—'}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Reputational Risk Score</span>
                    <p className="mt-1 font-medium">
                      {detailedRecord.risk_scoring && typeof detailedRecord.risk_scoring === 'object'
                        ? (detailedRecord.risk_scoring as RiskScoring).reputational_risk_score ?? '—'
                        : '—'}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Legal Risk Score</span>
                    <p className="mt-1 font-medium">
                      {detailedRecord.risk_scoring && typeof detailedRecord.risk_scoring === 'object'
                        ? (detailedRecord.risk_scoring as RiskScoring).legal_risk_score ?? '—'
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
                ) : imageUrl ? (
                  <div
                    className="border rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setIsImageExpanded(true)}
                  >
                    <img
                      src={imageUrl}
                      alt="Article scan"
                      className="w-full h-auto max-h-96 object-contain"
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
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Article Image</DialogTitle>
          </DialogHeader>
          {imageUrl && (
            <div className="flex justify-center p-4">
              <img
                src={imageUrl}
                alt="Article scan (expanded)"
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Sheet>
  );
};

export default RecordDetailsSheet;

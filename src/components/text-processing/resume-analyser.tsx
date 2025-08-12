import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LockedFeature } from "@/components/ui/locked-feature";
import { DocumentUpload } from "@/components/DocumentUpload";
import { ArrowRight } from "lucide-react";
import { TextProcessingState } from "@/pages/TextProcessing";
import { ResumeAnalysisShimmer } from "@/components/ContentShimmer";
import { ContentGenerationShimmer } from "@/components/UploadShimmer";

const exampleResumeAnalysis = (jobDescription: string) => ({
  bestPractices: [
    "Use strong action verbs (e.g., 'led', 'developed', 'implemented') to describe your achievements.",
    "Quantify results where possible (e.g., 'increased sales by 20%').",
    "Keep your resume concise, ideally one page for most roles.",
  ],
  tailoredSuggestions: [
    `Include keywords from the job description, such as "${jobDescription.slice(0, 20)}...".`,
    "Highlight relevant skills that match the job requirements.",
    "Emphasize experience that aligns with the role's responsibilities.",
  ],
  generalRecommendations: [
    "Use a clean, professional format with consistent fonts and spacing.",
    "Ensure no spelling or grammatical errors.",
    "Include a summary section tailored to the job.",
  ],
});

interface ResumeAnalyserProps {
  state: TextProcessingState;
  isLocked: boolean;
}

const ResumeAnalyser = ({ state, isLocked }: ResumeAnalyserProps) => {
  const { resumeFile, setResumeFile, resumeJobDescription, setResumeJobDescription, resumeAnalysis, setResumeAnalysis, isResumeLoading, setIsResumeLoading } = state;

  const handleAnalyseResume = () => {
    setIsResumeLoading(true);
    setResumeAnalysis(null);
    setTimeout(() => {
      setResumeAnalysis(exampleResumeAnalysis(resumeJobDescription));
      setIsResumeLoading(false);
    }, 2000);
  };

  return (
    <LockedFeature isLocked={isLocked}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Resume</CardTitle>
            <CardDescription>
              Upload a PDF or Word document containing your resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUpload 
              onUpload={setResumeFile} 
              isLoading={isResumeLoading}
            />
            <div className="mt-4">
              <label className="text-sm font-medium mb-1 block">Job Description</label>
              <textarea
                className="w-full border rounded-md p-3 min-h-[100px] resize-none"
                placeholder="Enter the job description or profile for the position..."
                value={resumeJobDescription}
                onChange={(e) => setResumeJobDescription(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Ensure the resume is well-formatted for accurate analysis.
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resume Analysis</CardTitle>
            <CardDescription>
              Suggestions and best practices will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto border bg-background rounded-md px-4 py-3 shadow-inner">
              {isResumeLoading && (
                <ResumeAnalysisShimmer />
              )}
              {!isResumeLoading && resumeAnalysis && (
                <div className="space-y-6">
                  <section>
                    <h3 className="font-bold text-lg mb-2">Best Practices</h3>
                    <ul className="list-disc pl-5 text-base text-gray-700">
                      {resumeAnalysis.bestPractices.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3 className="font-bold text-lg mb-2">Tailored Suggestions</h3>
                    <ul className="list-disc pl-5 text-base text-gray-700">
                      {resumeAnalysis.tailoredSuggestions.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3 className="font-bold text-lg mb-2">General Recommendations</h3>
                    <ul className="list-disc pl-5 text-base text-gray-700">
                      {resumeAnalysis.generalRecommendations.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </section>
                </div>
              )}
              {!isResumeLoading && !resumeAnalysis && (
                <div className="text-muted-foreground text-sm text-center py-10">
                  No analysis generated yet. Upload a resume and enter a job description to start!
                </div>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <Button
                onClick={handleAnalyseResume}
                disabled={!resumeFile || !resumeJobDescription.trim() || isResumeLoading}
                className="w-full"
              >
                {isResumeLoading ? (
                  <ContentGenerationShimmer />
                ) : (
                  <>
                    Analyse Resume
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Follow these suggestions to improve your resume's effectiveness.
          </CardFooter>
        </Card>
      </div>
    </LockedFeature>
  );
};

export default ResumeAnalyser;

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { type AdaptiveQuizOutput } from "@/ai/flows/adaptive-quiz-engine";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, XCircle, Award } from "lucide-react";
import { createQuiz } from "./actions";

type QuizQuestion = AdaptiveQuizOutput["quiz"][0];

const quizFormSchema = z.object({
  topic: z.string().min(2, { message: "Topic must be at least 2 characters." }),
  numQuestions: z.coerce.number().min(1, "Please enter at least 1 question.").max(10, "You can generate a maximum of 10 questions."),
  educationLevel: z.string().min(3, { message: "Please specify an educational level." }),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
});


export default function QuizPage() {
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [quizTopic, setQuizTopic] = useState("");

  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof quizFormSchema>>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: { topic: "Algebra", numQuestions: 3, educationLevel: "High School", difficulty: "Medium" },
  });

  const onSubmit = async (values: z.infer<typeof quizFormSchema>) => {
    setIsLoading(true);
    try {
      const result = await createQuiz(values);
      setQuiz(result.quiz);
      setQuizTopic(values.topic);
      setQuizStartTime(Date.now());
      // Reset state for new quiz
      setCurrentQuestionIndex(0);
      setScore(0);
      setIsFinished(false);
      setIsAnswered(false);
      setSelectedAnswer(null);
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast({
        title: "Error creating quiz",
        description: "There was a problem generating your quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = () => {
    if (!selectedAnswer) return;
    setIsAnswered(true);
    const correctAnswer = quiz![currentQuestionIndex].correctAnswer;

    // Use loose comparison (trim whitespace)
    if (selectedAnswer.trim() === correctAnswer.trim()) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < quiz!.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Quiz finished - submit results
      setIsFinished(true);

      if (user) {
        const timeSpent = Math.floor((Date.now() - quizStartTime) / 1000); // seconds
        const finalScore = score / quiz!.length;

        try {
          const response = await fetch('/api/quiz/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentId: user.uid,
              topic: quizTopic,
              score: finalScore,
              timeSpent,
              questionsAttempted: quiz!.length,
            }),
          });

          if (response.ok) {
            toast({
              title: 'Quiz results saved!',
              description: 'Your progress has been recorded.',
            });
          }
        } catch (error) {
          console.error('Error submitting quiz:', error);
        }
      }
    }
  };

  const resetQuiz = () => {
    setQuiz(null);
    form.reset();
    setIsFinished(false);
  }

  const currentQuestion = quiz ? quiz[currentQuestionIndex] : null;

  if (isLoading) {
    return <div className="flex flex-col justify-center items-center h-full gap-4">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-muted-foreground">Generating your custom quiz...</p>
    </div>;
  }

  if (isFinished) {
    const quizLength = quiz?.length || 0;
    const finalScore = (quizLength > 0) ? (score / quizLength) * 100 : 0;
    return (
      <Card className="max-w-2xl mx-auto text-center">
        <CardHeader>
          <Award className="mx-auto h-16 w-16 text-yellow-500" />
          <CardTitle className="font-headline text-3xl">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xl">Your final score is:</p>
          <p className="text-5xl font-bold text-primary">{score} / {quizLength}</p>
          <Progress value={finalScore} className="w-full" />
          <Button onClick={resetQuiz}>Take Another Quiz</Button>
        </CardContent>
      </Card>
    );
  }

  if (quiz && currentQuestion) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Question {currentQuestionIndex + 1} of {quiz.length}</CardTitle>
          <Progress value={((currentQuestionIndex + 1) / quiz.length) * 100} className="w-full" />
          <CardDescription className="pt-4 text-lg">{currentQuestion.question}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup onValueChange={setSelectedAnswer} value={selectedAnswer || ""} disabled={isAnswered} className="space-y-2">
            {currentQuestion.options.map((option, index) => {
              const isCorrect = option.trim() === currentQuestion.correctAnswer.trim();
              const isSelected = option === selectedAnswer;
              let variant: "correct" | "incorrect" | "default" = "default";
              if (isAnswered && isCorrect) variant = "correct";
              if (isAnswered && isSelected && !isCorrect) variant = "incorrect";

              return (
                <Label key={index}
                  className={`flex items-center p-4 rounded-md border cursor-pointer transition-all ${variant === 'correct' ? 'border-green-500 bg-green-50' :
                    variant === 'incorrect' ? 'border-red-500 bg-red-50' :
                      'hover:bg-accent'
                    } ${isAnswered ? 'cursor-not-allowed' : ''}`}>
                  <RadioGroupItem value={option} id={`option-${index}`} className="mr-3" />
                  <span>{option}</span>
                  {isAnswered && isCorrect && <CheckCircle className="ml-auto text-green-500" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="ml-auto text-red-500" />}
                </Label>
              );
            })}
          </RadioGroup>

          <div className="mt-6 flex justify-end">
            {isAnswered ? (
              <Button onClick={handleNextQuestion}>
                {currentQuestionIndex < quiz.length - 1 ? "Next Question" : "Finish Quiz"}
              </Button>
            ) : (
              <Button onClick={handleAnswerSubmit} disabled={!selectedAnswer}>Submit Answer</Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Adaptive Quiz Engine</h1>
        <p className="text-muted-foreground">Generate a quick quiz on any topic to test your knowledge.</p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Create a Quiz</CardTitle>
          <CardDescription>Specify your topic, level, and desired difficulty to begin.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Photosynthesis" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="educationLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Educational Level</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., High School Biology" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="numQuestions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Questions</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">Start Quiz</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

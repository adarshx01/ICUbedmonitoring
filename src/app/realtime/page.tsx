import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function MedicalChatbotEmbed() {
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Medical Assistant</CardTitle>
          <CardDescription className="text-center">Ask me anything about medical dosages and treatments</CardDescription>
        </CardHeader>
        <CardContent>
        <iframe
            src="http://localhost:8501/"
            className="w-full h-[600px]"
            style={{ border: "none" }}
            title="Medical Assistant Embed"
          ></iframe>
<iframe src="http://localhost:5000" width="640" height="480" frameborder="0"></iframe>
        </CardContent>
      </Card>
    </div>
  );
}

import { ArrowLeft, Download, Printer, MessageSquare, X, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Report } from '../store/slices/reportsSlice';
import jsPDF from 'jspdf';
import { useState } from 'react';

interface ReportDetailViewProps {
  report: Report;
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ReportDetailView({ report, onBack }: ReportDetailViewProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI radiology assistant. I can help you understand this report, answer questions about the findings, or provide additional context. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(inputMessage, report),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const generateAIResponse = (question: string, report: Report): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('stroke') || lowerQuestion.includes('ischemic')) {
      return 'Based on the report, the patient has suffered an acute ischemic stroke in the left middle cerebral artery (MCA) territory. This type of stroke occurs when blood flow to a part of the brain is blocked, causing tissue damage. The CT and MRI images confirm restricted diffusion in the affected areas, which is characteristic of acute ischemia. The report indicates approximately 4mm of midline shift, which suggests some swelling and mass effect.';
    }
    
    if (lowerQuestion.includes('treatment') || lowerQuestion.includes('intervention')) {
      return 'The report recommends immediate intervention within the therapeutic window. For acute ischemic stroke, this typically involves endovascular thrombectomy (mechanical removal of the clot) if the patient is within 6-24 hours of symptom onset, and/or thrombolytic therapy (clot-busting medication) if within 4.5 hours. The presence of mass effect and midline shift requires close monitoring for potential complications.';
    }
    
    if (lowerQuestion.includes('prognosis') || lowerQuestion.includes('outcome')) {
      return 'The prognosis depends on several factors including the size of the infarct, speed of intervention, and the patient\'s overall health. The report shows a significant area of involvement (3.5 x 2.8 cm) with mass effect, which indicates a moderate to large stroke. Early intervention can significantly improve outcomes. Follow-up imaging is recommended to monitor for hemorrhagic transformation and progression.';
    }
    
    if (lowerQuestion.includes('finding') || lowerQuestion.includes('what does')) {
      return 'The key finding is multiple hypodense (darker) areas in the left brain hemisphere on CT, with corresponding restricted diffusion on MRI. This confirms acute ischemic stroke. The "mass effect with 4mm rightward midline shift" means the affected brain tissue is swelling and pushing structures to the right side. No hemorrhage (bleeding) was detected, which is important for treatment decisions.';
    }

    if (lowerQuestion.includes('mri') || lowerQuestion.includes('ct')) {
      return 'The CT scan shows hypodense (darker) regions indicating reduced blood flow and tissue damage. The MRI with DWI (diffusion-weighted imaging) is more sensitive and confirms acute ischemia by showing restricted diffusion. Together, these imaging modalities provide complementary information - CT is faster and rules out hemorrhage, while MRI is more sensitive for detecting early ischemic changes.';
    }
    
    return 'I can help explain specific findings in the report, discuss treatment options, clarify medical terminology, or answer questions about the prognosis. Could you please be more specific about what aspect of the report you\'d like me to explain?';
  };

  const handleDownloadPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    const addText = (text: string, fontSize: number, isBold = false) => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      const lines = pdf.splitTextToSize(text, contentWidth);
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += fontSize * 0.5;
      });
      yPosition += 3;
    };

    pdf.setFillColor(0, 169, 224);
    pdf.rect(0, 0, pageWidth, 25, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RADIOLOGY REPORT', margin, 15);
    
    yPosition = 35;
    pdf.setTextColor(0, 0, 0);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PATIENT INFORMATION', margin, yPosition); yPosition += 7;

    pdf.setFont('helvetica', 'normal');
    pdf.text(`Patient Name: ${report.patientName}`, margin, yPosition); yPosition += 5;
    pdf.text(`MRN: ${report.patientId}`, margin, yPosition); yPosition += 5;
    pdf.text(`Study Date: ${report.studyDate}`, margin, yPosition); yPosition += 5;
    pdf.text(`Modality: ${report.modality}`, margin, yPosition); yPosition += 5;
    pdf.text(`Body Part: ${report.bodyPart}`, margin, yPosition); yPosition += 5;
    pdf.text(`Radiologist: ${report.radiologist}`, margin, yPosition); yPosition += 10;

    const reportLines = report.reportText.split('\n');
    reportLines.forEach((line) => {
      if (line.trim().endsWith(':') && line.trim().length < 50) {
        yPosition += 3;
        addText(line, 10, true);
      } else {
        addText(line, 9, false);
      }
    });

    yPosition += 10;
    if (yPosition > pageHeight - 100) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('IMAGES:', margin, yPosition); yPosition += 7;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    report.images.forEach((img, idx) => {
      pdf.text(`${idx + 1}. ${img.label}`, margin + 5, yPosition); yPosition += 5;
    });

    const now = new Date();
    const footerText = `Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()} | Report ID: ${report.id}`;
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(footerText, margin, pageHeight - 10);

    pdf.save(`radiology-report-${report.patientId}-${report.studyDate}.pdf`);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#1E1E1E]">
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="border-b border-[#3E3E42] p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} size="sm" variant="ghost" className="text-white/80 hover:text-white hover:bg-[#3E3E42]">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Reports
              </Button>
              <div className="h-6 w-px bg-[#3E3E42]" />
              <h2 className="text-xl text-white/90">Radiology Report</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsChatOpen(!isChatOpen)} size="sm" variant="outline" className={`${isChatOpen ? 'bg-[#00A9E0] border-[#00A9E0] text-white' : 'bg-transparent border-[#3E3E42] text-white/80 hover:bg-[#3E3E42] hover:text-white'}`}>
                <MessageSquare className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
              <Button onClick={handleDownloadPDF} size="sm" className="bg-[#00A9E0] hover:bg-[#0090c0] text-white">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={() => window.print()} size="sm" variant="outline" className="bg-transparent border-[#3E3E42] text-white/80 hover:bg-[#3E3E42] hover:text-white">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="bg-[#2B2B2B] border border-[#3E3E42] rounded-lg p-6">
              <h3 className="text-lg text-white/90 mb-4">Patient Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-sm text-white/60">Patient Name:</span><p className="text-white/90">{report.patientName}</p></div>
                <div><span className="text-sm text-white/60">MRN:</span><p className="text-white/90">{report.patientId}</p></div>
                <div><span className="text-sm text-white/60">Study Date:</span><p className="text-white/90">{report.studyDate}</p></div>
                <div><span className="text-sm text-white/60">Modality:</span><p className="text-white/90">{report.modality}</p></div>
                <div><span className="text-sm text-white/60">Body Part:</span><p className="text-white/90">{report.bodyPart}</p></div>
                <div><span className="text-sm text-white/60">Radiologist:</span><p className="text-white/90">{report.radiologist}</p></div>
                <div><span className="text-sm text-white/60">Status:</span><p className="text-green-400">{report.status}</p></div>
                <div><span className="text-sm text-white/60">Report Type:</span><p className="text-white/90 capitalize">{report.reportType}</p></div>
              </div>
            </div>

            <div className="bg-[#2B2B2B] border border-[#3E3E42] rounded-lg p-6">
              <h3 className="text-lg text-white/90 mb-4">Study Images</h3>
              <div className="grid grid-cols-2 gap-4">
                {report.images.map((image, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="aspect-square bg-black rounded-lg overflow-hidden border border-[#3E3E42]">
                      <img src={image.url} alt={image.label} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm text-white/80 text-center">{image.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#2B2B2B] border border-[#3E3E42] rounded-lg p-6">
              <h3 className="text-lg text-white/90 mb-4">Report</h3>
              <div className="text-white/80 whitespace-pre-wrap font-mono text-sm leading-relaxed">{report.reportText}</div>
            </div>

            <div className="bg-[#2B2B2B] border border-[#3E3E42] rounded-lg p-6">
              <h3 className="text-lg text-white/90 mb-4">Key Findings</h3>
              <p className="text-white/80 leading-relaxed">{report.findings}</p>
            </div>

            <div className="bg-[#2B2B2B] border border-[#00A9E0] rounded-lg p-6">
              <h3 className="text-lg text-[#00A9E0] mb-4">Impression</h3>
              <p className="text-white/90 leading-relaxed">{report.impression}</p>
            </div>

            <div className="text-center text-sm text-white/40 pt-4 pb-8">
              Report generated on {new Date(report.generatedDate).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {isChatOpen && (
        <div className="w-96 border-l border-[#3E3E42] flex flex-col bg-[#1E1E1E] h-full">
          <div className="p-4 border-b border-[#3E3E42] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-[#00A9E0]" /><h3 className="text-white/90">AI Assistant</h3></div>
            <Button onClick={() => setIsChatOpen(false)} size="sm" variant="ghost" className="text-white/60 hover:text-white hover:bg-[#3E3E42] h-8 w-8 p-0"><X className="h-4 w-4" /></Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user' ? 'bg-[#00A9E0] text-white' : 'bg-[#2B2B2B] text-white/90 border border-[#3E3E42]'}`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-xs mt-1 opacity-60">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-[#3E3E42] flex-shrink-0">
            <div className="flex gap-2">
              <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask about the report..." className="flex-1 bg-[#2B2B2B] border border-[#3E3E42] rounded px-3 py-2 text-sm text-white/90 placeholder:text-white/40 focus:outline-none focus:border-[#00A9E0]" />
              <Button onClick={handleSendMessage} size="sm" className="bg-[#00A9E0] hover:bg-[#0090c0] text-white" disabled={!inputMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-white/40 mt-2">AI Assistant can help explain findings and answer questions</p>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { FolderOpen, Trash2, Eye } from "lucide-react";

interface DicomDataModuleProps {
  onViewStudy?: (studyId: string) => void;
}

export function DicomDataModule({ onViewStudy }: DicomDataModuleProps) {
  const [studies, setStudies] = useState([
    {
      id: "1",
      patientName: "Smith, John",
      patientId: "123456789",
      studyDate: "2024-11-08",
      modality: "CT",
      description: "CT Abdomen/Pelvis",
      series: 12
    },
    {
      id: "2",
      patientName: "Doe, Jane",
      patientId: "987654321",
      studyDate: "2024-11-07",
      modality: "MRI",
      description: "MRI Brain",
      series: 8
    },
    {
      id: "3",
      patientName: "Johnson, Bob",
      patientId: "456789123",
      studyDate: "2024-11-06",
      modality: "CT",
      description: "CT Chest",
      series: 6
    }
  ]);

  const handleDeleteStudy = (studyId: string) => {
    // Confirm deletion
    const studyToDelete = studies.find(s => s.id === studyId);
    if (studyToDelete && window.confirm(`Delete study "${studyToDelete.description}" for ${studyToDelete.patientName}?`)) {
      setStudies(prev => prev.filter(study => study.id !== studyId));
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1E1E1E]">
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white/90">DICOM Studies</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-[#2B2B2B] border-[#3E3E42] text-white/80 hover:bg-[#3E3E42]"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Import Study
            </Button>
          </div>
        </div>

        <div className="flex-1 bg-[#2B2B2B] border border-[#3E3E42] rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-[#3E3E42] hover:bg-[#3E3E42]">
                <TableHead className="text-white/70">Patient Name</TableHead>
                <TableHead className="text-white/70">Patient ID</TableHead>
                <TableHead className="text-white/70">Study Date</TableHead>
                <TableHead className="text-white/70">Modality</TableHead>
                <TableHead className="text-white/70">Description</TableHead>
                <TableHead className="text-white/70">Series</TableHead>
                <TableHead className="text-white/70">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studies.map((study) => (
                <TableRow key={study.id} className="border-[#3E3E42] hover:bg-[#3E3E42]">
                  <TableCell className="text-white/80">{study.patientName}</TableCell>
                  <TableCell className="text-white/80">{study.patientId}</TableCell>
                  <TableCell className="text-white/80">{study.studyDate}</TableCell>
                  <TableCell className="text-white/80">{study.modality}</TableCell>
                  <TableCell className="text-white/80">{study.description}</TableCell>
                  <TableCell className="text-white/80">{study.series}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-white/60 hover:text-white hover:bg-[#3E3E42]"
                        onClick={() => onViewStudy?.(study.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-white/60 hover:text-red-500 hover:bg-[#3E3E42]"
                        onClick={() => handleDeleteStudy(study.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-xs text-white/50">
          {studies.length} studies loaded
        </div>
      </div>
    </div>
  );
}

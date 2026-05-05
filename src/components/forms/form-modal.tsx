"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ReactNode, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "month" | "email" | "textarea" | "select";
  placeholder?: string;
  value?: any;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  step?: string | number;
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon: ReactNode;
  fields: FormField[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
}

export function FormModal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  fields,
  initialData = {},
  onSubmit,
  submitLabel = "Salvar",
  isLoading = false,
}: FormModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const newData: Record<string, any> = {};
      fields.forEach((field) => {
        newData[field.name] = initialData[field.name] ?? field.value ?? "";
      });
      setFormData(newData);
    }
  }, [isOpen, fields, initialData]);

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const requiredFields = fields.filter((f) => f.required);
    const missingFields = requiredFields.filter((f) => !formData[f.name]);

    if (missingFields.length > 0) {
      alert(`Campos obrigatórios: ${missingFields.map((f) => f.label).join(", ")}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar. Verifique os dados.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md overflow-y-auto p-0 border-l border-slate-200 shadow-2xl bg-white">
        <div className="h-2 w-full bg-emerald-500/20" />

        <div className="p-8 space-y-8">
          <SheetHeader className="text-left space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                {icon}
              </div>
              <div>
                <SheetTitle className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                  {title}
                </SheetTitle>
                {description && (
                  <SheetDescription className="text-slate-400 font-medium text-xs">
                    {description}
                  </SheetDescription>
                )}
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {field.label}
                  {field.required && <span className="text-red-500"> *</span>}
                </label>

                {field.type === "textarea" ? (
                  <textarea
                    placeholder={field.placeholder}
                    className="w-full min-h-[100px] bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-emerald-500/20 focus:ring-2 outline-none text-sm p-4 transition"
                    value={formData[field.name] ?? ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                  />
                ) : field.type === "select" ? (
                  <select
                    className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-emerald-500/20 focus:ring-2 text-sm font-medium outline-none transition"
                    value={formData[field.name] ?? ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    step={field.step}
                    className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-emerald-500/20 focus:ring-2 outline-none text-sm transition"
                    value={formData[field.name] ?? ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 pt-4 pb-8">
            <Button
              className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-tight shadow-xl shadow-emerald-500/20 gap-2"
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              {submitLabel}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

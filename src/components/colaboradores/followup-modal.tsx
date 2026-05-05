"use client";

import { FormModal, FormField } from "@/components/forms/form-modal";
import { createFollowup } from "@/app/actions/colaborador-actions";
import { MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface FollowupModalProps {
  colaborador: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FollowupModal({ colaborador, isOpen, onClose }: FollowupModalProps) {
  if (!colaborador) return null;

  const fields: FormField[] = [
    {
      name: "tipo",
      label: "Tipo de Follow-up",
      type: "select",
      required: true,
      value: "SEMANA_1",
      options: [
        { value: "SEMANA_1", label: "Semana 1" },
        { value: "MES_1", label: "Mês 1" },
        { value: "FEEDBACK_45", label: "Feedback 45 dias" },
        { value: "FEEDBACK_90", label: "Feedback 90 dias" },
        { value: "OUTRO", label: "Outro (Ad hoc)" },
      ],
    },
    {
      name: "data_prevista",
      label: "Data Prevista",
      type: "date",
      required: true,
      value: format(new Date(), "yyyy-MM-dd"),
    },
    {
      name: "notas",
      label: "Pauta ou Notas Iniciais",
      type: "textarea",
      placeholder: "Detalhes ou do que se trata...",
    },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    await createFollowup({
      colaborador_id: colaborador.id,
      tipo: data.tipo,
      data_prevista: new Date(data.data_prevista),
      notas: data.notas,
    });
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Agendar Follow-up"
      description={colaborador.nome}
      icon={<MessageSquare className="w-6 h-6" />}
      fields={fields}
      onSubmit={handleSubmit}
      submitLabel="Salvar Agendamento"
    />
  );
}

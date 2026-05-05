"use client";

import { FormModal, FormField } from "@/components/forms/form-modal";
import { createHoraExtra } from "@/app/actions/colaborador-actions";
import { Clock } from "lucide-react";
import { format } from "date-fns";

interface HoraExtraModalProps {
  colaborador: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function HoraExtraModal({ colaborador, isOpen, onClose }: HoraExtraModalProps) {
  if (!colaborador) return null;

  const fields: FormField[] = [
    {
      name: "mes_referencia",
      label: "Mês de Referência",
      type: "month",
      required: true,
      value: format(new Date(), "yyyy-MM"),
    },
    {
      name: "horas",
      label: "Quantidade de Horas",
      type: "number",
      placeholder: "Ex: 2.5",
      step: "0.5",
      required: true,
    },
    {
      name: "observacao",
      label: "Observações Extras",
      type: "textarea",
      placeholder: "Detalhes ou justificativa...",
    },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    await createHoraExtra({
      colaborador_id: colaborador.id,
      mes_referencia: data.mes_referencia,
      horas: parseFloat(data.horas),
      observacao: data.observacao,
    });
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Lançar Hora Extra"
      description={colaborador.nome}
      icon={<Clock className="w-6 h-6" />}
      fields={fields}
      onSubmit={handleSubmit}
      submitLabel="Salvar Lançamento"
    />
  );
}

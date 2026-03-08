"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save } from "lucide-react"

export function MarketCheckForm({ productId }: { productId: string }) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [priorExperience, setPriorExperience] = useState('untested')

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const getScore = (name: string) => Number(formData.get(name)) || 0
        const getText = (name: string) => (formData.get(name) as string) || null

        const payload = {
            product_id: productId,
            meta_ads_signal_score: getScore('meta_ads_signal_score'),
            tiktok_signal_score: getScore('tiktok_signal_score'),
            marketplace_signal_score: getScore('marketplace_signal_score'),
            competitive_saturation_score: getScore('competitive_saturation_score'),
            differentiation_score: getScore('differentiation_score'),
            demo_potential_score: getScore('demo_potential_score'),
            offer_clarity_score: getScore('offer_clarity_score'),
            operational_simplicity_score: getScore('operational_simplicity_score'),
            prior_experience: priorExperience,
            meta_notes: getText('meta_notes'),
            tiktok_notes: getText('tiktok_notes'),
            marketplace_notes: getText('marketplace_notes'),
            general_notes: getText('general_notes'),
            meta_evidence_url: getText('meta_evidence_url'),
            tiktok_evidence_url: getText('tiktok_evidence_url'),
            marketplace_evidence_url: getText('marketplace_evidence_url')
        }

        const { error } = await supabase
            .from('codpi_product_market_checks')
            .insert(payload)

        setLoading(false)

        if (error) {
            toast.error('Error al guardar: ' + error.message)
        } else {
            toast.success('Chequeo de mercado guardado exitosamente')
                // Reset form
                ; (e.target as HTMLFormElement).reset()
            setPriorExperience('untested')
            router.refresh()
        }
    }

    const scoreOptions = [0, 1, 2, 3, 4, 5]

    const SelectScore = ({ name, label }: { name: string, label: string }) => (
        <div className="flex flex-col gap-2">
            <Label htmlFor={name}>{label} (0-5)</Label>
            <Select name={name} defaultValue="0">
                <SelectTrigger>
                    <SelectValue placeholder="0" />
                </SelectTrigger>
                <SelectContent>
                    {scoreOptions.map(val => (
                        <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <h3 className="text-lg font-medium">Nuevo Chequeo Rápido de Mercado</h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SelectScore name="meta_ads_signal_score" label="Señal Meta Ads" />
                <SelectScore name="tiktok_signal_score" label="Señal TikTok" />
                <SelectScore name="marketplace_signal_score" label="Señal Marketplace" />
                <SelectScore name="competitive_saturation_score" label="Saturación" />
                <SelectScore name="differentiation_score" label="Diferenciación" />
                <SelectScore name="demo_potential_score" label="Potencial Demo" />
                <SelectScore name="offer_clarity_score" label="Claridad Oferta" />
                <SelectScore name="operational_simplicity_score" label="Simplicidad Operativa" />
            </div>

            <div className="flex flex-col gap-2 lg:w-1/4">
                <Label htmlFor="prior_experience">Experiencia Previa *</Label>
                <Select value={priorExperience} onValueChange={(val) => setPriorExperience(val || 'untested')} required>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="positive">Positiva</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="negative">Negativa</SelectItem>
                        <SelectItem value="untested">Sin probar</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="meta_evidence_url">URL Evidencia Meta</Label>
                    <Input id="meta_evidence_url" name="meta_evidence_url" placeholder="https..." />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="tiktok_evidence_url">URL Evidencia TikTok</Label>
                    <Input id="tiktok_evidence_url" name="tiktok_evidence_url" placeholder="https..." />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="marketplace_evidence_url">URL Evidencia Marketplace</Label>
                    <Input id="marketplace_evidence_url" name="marketplace_evidence_url" placeholder="https..." />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="general_notes">Notas Generales</Label>
                <Textarea id="general_notes" name="general_notes" placeholder="Conclusiones rápidas..." />
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? 'Guardando...' : 'Guardar Chequeo'}
                </Button>
            </div>
        </form>
    )
}

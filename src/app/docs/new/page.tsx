import { NewDocForm } from './NewDocForm'

export default function NewDocPage() {
    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto h-full">
            <h1 className="text-3xl font-bold tracking-tight">Nuevo Documento SOP</h1>
            <NewDocForm />
        </div>
    )
}

import { FlashCardForm } from "../components/FlashCardForm";


export default function Home() {
  return (
    <div className="container mx-auto p-10">
      <h1 className="text-2xl font-bold mb-5">FlashCards</h1>
      <FlashCardForm />
    </div>
  );
}
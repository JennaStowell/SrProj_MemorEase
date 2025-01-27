import CommentForm from "../components/CommentForm";


export default function Home() {
  return (
    <div className="container mx-auto p-10">
      <h1 className="text-2xl font-bold mb-5">Database Test</h1>
      <CommentForm />
    </div>
  );
}

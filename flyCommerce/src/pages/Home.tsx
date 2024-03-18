import { useNavigate } from "react-router-dom";

export const Home = () => {
  const router = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const name = (
      e.currentTarget.elements.namedItem("name") as HTMLInputElement
    ).value;

    localStorage.setItem("name", name);
    router("/chat");
  };

  return (
    <div className="w-full h-screen flex  justify-center items-center ">
      <form
        className="flex flex-col justify-center gap-6 border p-4 rounded-md bg-gray-100 w-1/4"
        onSubmit={handleSubmit}
      >
        <label htmlFor="name" className="">
          Name
        </label>
        <input
          placeholder="name"
          id="name"
          className="border rounded-md border-blue-500 px-2"
        />
        <button type="submit" className="bg-blue-300 rounded-lg text-white">
          Submit
        </button>
      </form>
    </div>
  );
};

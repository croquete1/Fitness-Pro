
export default function Login() {
  return (
    <div className="h-screen flex items-center justify-center bg-base-100">
      <div className="p-8 bg-base-200 rounded-box shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <form className="form-control gap-4">
          <input type="text" placeholder="Email" className="input input-bordered" />
          <input type="password" placeholder="Password" className="input input-bordered" />
          <button className="btn btn-primary">Entrar</button>
        </form>
      </div>
    </div>
  );
}

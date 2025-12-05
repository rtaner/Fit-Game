'use client';

export default function TestAdminPage() {
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('current-user') : null;
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Admin Page</h1>
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">User Data:</h2>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
      <div className="mt-4">
        <a href="/users" className="text-blue-600 underline">
          Go to /users
        </a>
      </div>
    </div>
  );
}

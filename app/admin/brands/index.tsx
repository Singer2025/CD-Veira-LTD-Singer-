import { useState, useEffect } from 'react';
import AdminLayout from '@/app/[locale]/admin/layout';
import { IBrand } from '@/lib/db/models/brand.model';

interface IBrandWithId extends IBrand {
  _id: string;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<IBrandWithId[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<IBrandWithId | null>(null);

  useEffect(() => {
    fetch('/api/brands')
      .then(res => res.json())
      .then((data: IBrandWithId[]) => setBrands(data))
      .catch(err => console.error('Error fetching brands:', err));
  }, []);

  const handleEdit = (brand: IBrandWithId) => {
    setSelectedBrand(brand);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await fetch(`/api/brands/${id}`, { method: 'DELETE' });
      setBrands(prev => prev.filter(b => b._id !== id));
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl mb-4">Brand Management</h1>
        <button 
          className="bg-blue-500 text-white px-4 py-2 mb-4 rounded hover:bg-blue-600"
          onClick={() => setShowForm(true)}
        >
          New Brand
        </button>

        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {brands.map(brand => (
                <tr key={brand._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {brand.logo && (
                        <img 
                          src={brand.logo} 
                          alt={brand.name}
                          className="w-10 h-10 rounded-full mr-3 object-cover"
                        />
                      )}
                      <div>
                        <div>{brand.name}</div>

                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {brand.isFeatured ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Featured</span>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 flex space-x-2">
                    <button 
                      className="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500 text-white"
                      onClick={() => handleEdit(brand)}
                    >
                      Edit
                    </button>
                    <button 
                      className="bg-red-500 px-2 py-1 rounded hover:bg-red-600 text-white"
                      onClick={() => handleDelete(brand._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showForm && (
          <BrandForm 
            onClose={() => setShowForm(false)}
            initialValues={selectedBrand}
          />
        )}
      </div>
    </AdminLayout>
  );
}

interface BrandFormProps {
  onClose: () => void;
  initialValues?: IBrandWithId | null;
}

const BrandForm = ({ onClose, initialValues }: BrandFormProps) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [slug, setSlug] = useState(initialValues?.slug || '');
  const [logo, setLogo] = useState(initialValues?.logo || '');

  const [isFeatured, setIsFeatured] = useState(initialValues?.isFeatured || false);
  const isEdit = !!initialValues;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      slug,
      logo,

      isFeatured
    };

    try {
      if (isEdit) {
        await fetch(`/api/brands/${initialValues!._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/brands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error saving brand:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded shadow w-1/3">
        <h2 className="text-2xl mb-4">{isEdit ? 'Edit Brand' : 'New Brand'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Slug</label>
            <input 
              type="text" 
              value={slug} 
              onChange={e => setSlug(e.target.value)} 
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Logo URL</label>
            <input
              type="text"
              value={logo}
              onChange={e => setLogo(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={e => setIsFeatured(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isFeatured" className="text-gray-700 text-sm font-bold">
              Featured Brand
            </label>
          </div>
          <div className="flex justify-end">
            <button 
              type="button" 
              className="bg-gray-300 px-4 py-2 mr-2 rounded hover:bg-gray-400" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
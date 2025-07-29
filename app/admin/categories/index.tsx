import { useState, useEffect } from 'react';
    import AdminLayout from '@/app/[locale]/admin/layout';
    import { ICategory } from '@/lib/db/models/category.model';

    interface ICategoryWithId extends ICategory {
      _id: string;
    }

    export default function CategoriesPage() {
      const [categories, setCategories] = useState<ICategoryWithId[]>([]);
      const [showForm, setShowForm] = useState(false);
      const [selectedCategory, setSelectedCategory] = useState<ICategoryWithId | null>(null);

      useEffect(() => {
        fetch('/api/categories')
          .then(res => res.json())
          .then((data: ICategoryWithId[]) => setCategories(data))
          .catch(err => console.error('Error fetching categories:', err));
      }, []);

      const handleEdit = (category: ICategoryWithId) => {
        setSelectedCategory(category);
        setShowForm(true);
      };

      const handleDelete = async (id: string) => {
        if (confirm('Are you sure?')) {
          await fetch(`/api/categories/${id}`, { method: 'DELETE' });
          setCategories(prev => prev.filter(c => c._id !== id));
        }
      };

      return (
        <AdminLayout>
          <div className="p-6">
            <h1 className="text-2xl mb-4">Category Management</h1>
            <button 
              className="bg-blue-500 text-white px-4 py-2 mb-4 rounded hover:bg-blue-600"
              onClick={() => setShowForm(true)}
            >
              New Category
            </button>

            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                   <th className="px-6 py-3">Actions</th>
                 </tr>
               </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map(category => (
                    <tr key={category._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {category.image && (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-10 h-10 rounded-full mr-3 object-cover"
                            />
                          )}
                          <div>
                            <div>{category.depth > 0 ? ' '.repeat(category.depth) : ''}{category.name}</div>
                            {category.description && (
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {category.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {category.isParent ? 'Parent Category' : 'Child Category'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {category.isFeatured ? (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Featured</span>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 flex space-x-2">
                        <button 
                          className="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500 text-white"
                          onClick={() => handleEdit(category)}
                        >
                          Edit
                        </button>
                        <button 
                          className="bg-red-500 px-2 py-1 rounded hover:bg-red-600 text-white"
                          onClick={() => handleDelete(category._id)}
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
              <CategoryForm 
                onClose={() => setShowForm(false)}
                initialValues={selectedCategory}
              />
            )}
          </div>
        </AdminLayout>
      );
    }

    interface CategoryFormProps {
      onClose: () => void;
      initialValues?: ICategoryWithId | null;
    }

    const CategoryForm = ({ onClose, initialValues }: CategoryFormProps) => {
      const [name, setName] = useState(initialValues?.name || '');
      const [slug, setSlug] = useState(initialValues?.slug || '');
      const [parentId, setParentId] = useState<string>('');
      const [image, setImage] = useState(initialValues?.image || '');
      const [description, setDescription] = useState(initialValues?.description || '');
      const [isFeatured, setIsFeatured] = useState(initialValues?.isFeatured || false);
      const [categories, setCategories] = useState<ICategoryWithId[]>([]);
      const isEdit = !!initialValues;

      useEffect(() => {
        fetch('/api/categories')
          .then(res => res.json())
          .then((data: ICategoryWithId[]) => setCategories(data))
          .catch(err => console.error('Error fetching categories:', err));
      }, []);

      useEffect(() => {
        if (initialValues) {
          setParentId(initialValues.parent ? initialValues.parent.toString() : '');
        }
      }, [initialValues]);

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
          name,
          slug,
          parent: parentId || undefined
        };

        try {
          if (isEdit) {
            await fetch(`/api/categories/${initialValues!._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          } else {
            await fetch('/api/categories', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          }
          onClose();
          window.location.reload();
        } catch (error) {
          console.error('Error saving category:', error);
        }
      };

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded shadow w-1/3">
            <h2 className="text-2xl mb-4">{isEdit ? 'Edit Category' : 'New Category'}</h2>
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
                <label className="block text-gray-700 text-sm font-bold mb-2">Image URL</label>
                <input
                  type="text"
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  rows={3}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Parent Category</label>
                <select
                  value={parentId}
                  onChange={e => setParentId(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                >
                  <option value="">No Parent (Root)</option>
                  {categories.map(cat => (
                    <option
                      key={cat._id}
                      value={cat._id}
                      disabled={cat._id === initialValues?._id}
                    >
                      {cat.depth > 0 ? ' '.repeat(cat.depth) + cat.name : cat.name}
                    </option>
                  ))}
                </select>
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
                  Featured Category
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
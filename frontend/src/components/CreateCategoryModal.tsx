'use client';

import { useState, FormEvent } from 'react';
import { CategoryService } from '../services/CategoryService';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated: () => void;
}

export default function CreateCategoryModal({ isOpen, onClose, onCategoryCreated }: CreateCategoryModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#FF6B6B');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const categoryService = new CategoryService();

  const presetColors = [
    '#800000', // Turquoise
    '#e6194B', // Rouge vif
    '#fabed4', // Rose
    '#9A6324', // Vert citron
    '#f58231', // Cyan
    '#ffd8b1', // Bleu-vert clair
    '#808000', // Violet moyen
    '#ffe119', // Jaune
    '#fffac8', // Rose profond
    '#3cb44b', // Orange
    '#aaffc3', // Tomate
    '#469990', // Marron
    '#42d4f4', // Violet
    '#000075', // Corail
    '#4363d8', // Vert
    '#911eb4', // Bleu
    '#dcbeff', // Rose chaud
    '#a9a9a9', // Orchidée
    '#ffffff', // Vert mer     '#000000', // Gris foncé
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await categoryService.createCategory({
        name,
        description: description || null,
        color,
      });

      setName('');
      setDescription('');
      setColor('#FF6B6B');
      onCategoryCreated();
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue lors de la création de la catégorie');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg border-2 border-black p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-black">Créer une catégorie</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-semibold mb-2 text-black">
              Nom de la catégorie
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Ex: Loisirs"
              required
              disabled={isLoading}
              minLength={2}
              maxLength={50}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold mb-2 text-black">
              Description (optionnel)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
              placeholder="Ex: Cinéma, concerts, sorties..."
              disabled={isLoading}
              maxLength={255}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-black">
              Couleur
            </label>
            <div className="flex items-center gap-4 mb-3">
              <input
                type="color"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-12 rounded border-2 border-black cursor-pointer"
                disabled={isLoading}
              />
              <span className="text-sm font-mono text-gray-600">{color}</span>
            </div>
            <div className="grid grid-cols-10 gap-2">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`w-8 h-8 rounded border-2 ${
                    color === presetColor ? 'border-black' : 'border-gray-300'
                  } hover:border-black transition-colors`}
                  style={{ backgroundColor: presetColor }}
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-200 text-black font-bold rounded-lg border-2 border-black hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-yellow-400 text-black font-bold rounded-lg border-2 border-black hover:bg-yellow-500 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

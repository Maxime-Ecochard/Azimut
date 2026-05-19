export const NUTRITION_PRODUCTS = [
  {
    id: 'p1',
    brand: 'Overstims',
    name: 'Gel Energix',
    category: 'Gels',
    flavor: 'Citron',
    carbsPer100g: 76,
    weightGram: 28,
    carbsPerUnit: 21
  },
  {
    id: 'p2',
    brand: 'Baouw',
    name: 'Barre Energétique',
    category: 'Barres',
    flavor: 'Cacao Noisette',
    carbsPer100g: 50,
    weightGram: 25,
    carbsPerUnit: 12.5
  },
  {
    id: 'p3',
    brand: 'Maurten',
    name: 'Drink Mix 160',
    category: 'Boissons',
    flavor: 'Neutre',
    carbsPer100g: 99,
    weightGram: 40,
    carbsPerUnit: 39
  },
  {
    id: 'p4',
    brand: 'Powerbar',
    name: 'PowerGel Original',
    category: 'Gels',
    flavor: 'Pomme verte',
    carbsPer100g: 65,
    weightGram: 41,
    carbsPerUnit: 26.5
  },
  {
    id: 'p5',
    brand: 'Decathlon',
    name: 'Pâte de fruits',
    category: 'Pâtes de fruits',
    flavor: 'Fraise',
    carbsPer100g: 82,
    weightGram: 25,
    carbsPerUnit: 20.5
  }
];

export function getProducts() {
  return NUTRITION_PRODUCTS;
}

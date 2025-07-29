'use client'

import { useRouter } from 'next/navigation'
import { createWebPage } from '@/lib/actions/web-page.actions'
import { useToast } from '@/hooks/use-toast'

export default function CreateWarrantyPage() {
  const router = useRouter()
  const { toast } = useToast()

  const createWarrantyPage = async () => {
    const warrantyContent = `# Warranty Coverage
C.D. Veira Ltd. stands behind the quality of every appliance we sell. Your appliance is covered under this warranty subject to the conditions and exclusions below.

---

### Refrigerators, Freezers & Bottle Coolers

* **Coverage Period:** 1 year
* **What's Covered:** Compressor, refrigerating unit, thermostat, overload protector, start-relay, and cabinet body
* **Exclusions:** Bulbs, glass or plastic parts; damage from improper installation or defective electrical supply; any customer negligence

---

### Washing Machines & Dryers

* **Coverage Period:** 1 year
* **What's Covered:** All mechanical and electrical components of the unit
* **Exclusions:** None beyond standard wear and tear

---

### Dishwashers

* **Coverage Period:** 1 year
* **What's Covered:** Complete dishwasher unit
* **Exclusions:** None beyond standard wear and tear

---

### Gas Cookers & Electric (Combination) or Fully Electric Cookers

* **Coverage Period:** 6 months
* **What's Covered:** Complete cooker unit
* **Exclusions:** Bulbs, glass, knobs; gas cylinder (empty or filled), regulator, hose or any other supplied fittings

---

### Microwave Ovens

* **Coverage Period:** 6 months
* **What's Covered:** Complete oven unit
* **Exclusions:** Bulbs, glass panels

---

### Sewing Machines

* **Coverage Period:** 6 months
* **What's Covered:** Complete sewing machine
* **Exclusions:** Bulbs, bobbin cases

---

### Furniture

* **Coverage Period:** 6 months
* **What's Covered:** Entire piece
* **Exclusions:** Knobs, glass inserts

---

### Televisions, Video Players & Radios

* **Coverage Period:** 3 months
* **What's Covered:** Complete electronic unit
* **Exclusions:** Screen damage caused by the consumer

---

## Important Notice
This warranty becomes void if any repairs or adjustments are performed by anyone other than a C.D. Veira Ltd. service technician or an authorized representative. During repairs, we are unable to provide a replacement appliance.

---

*I have read and fully understand the above conditions of sale and warranty.*`

    try {
      const res = await createWebPage({
        title: 'Warranty Coverage',
        slug: 'warranty',
        content: warrantyContent,
        isPublished: true
      })

      if (res.success) {
        toast({
          description: 'Warranty page created successfully!',
        })
        router.push('/admin/web-pages')
      } else {
        toast({
          variant: 'destructive',
          description: res.message || 'Failed to create warranty page',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'An error occurred while creating the warranty page',
      })
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create Warranty Page</h1>
      <p className="mb-4">This will create a warranty page with all the warranty information.</p>
      <button
        onClick={createWarrantyPage}
        className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
      >
        Create Warranty Page
      </button>
    </div>
  )
}
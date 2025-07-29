import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { UploadButton } from '@/lib/uploadthing'
import { ISettingInput } from '@/types'
import { TrashIcon } from 'lucide-react'
import Image from 'next/image'
import { useFieldArray, UseFormReturn } from 'react-hook-form'

export default function CarouselForm({
  form,
  id,
}: {
  form: UseFormReturn<ISettingInput>
  id: string
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'carousels',
  })

  // Ensure all carousels have isPublished set
  React.useEffect(() => {
    const carousels = form.getValues('carousels')
    if (carousels?.some(c => c.isPublished === undefined)) {
      form.setValue('carousels',
        carousels.map(c => ({
          ...c,
          isPublished: c.isPublished !== undefined ? c.isPublished : true
        })))
    }
  }, [form])
  const {
    watch,
    formState: { errors },
  } = form
  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle>Carousels</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-4'>
          {fields.map((field, index) => (
            <div key={field.id} className='flex justify-between gap-1 w-full  '>
              <FormField
                control={form.control}
                name={`carousels.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    {index == 0 && <FormLabel>Title</FormLabel>}
                    <FormControl>
                      <Input {...field} placeholder='Title' />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`carousels.${index}.textColor`}
                render={({ field }) => (
                  <FormItem className="w-32">
                    {index == 0 && <FormLabel>Text Color</FormLabel>}
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          {...field}
                          placeholder='#FFFFFF'
                          className="h-10"
                          onChange={(e) => {
                            // Validate hex color format
                            const value = e.target.value
                            if (/^#([0-9A-F]{3}){1,2}$/i.test(value) || value === '') {
                              field.onChange(value)
                            }
                          }}
                        />
                        <input
                          type="color"
                          value={field.value || '#FFFFFF'}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-10 w-10 p-1 border rounded"
                        />
                      </div>
                    </FormControl>
                    <FormMessage>
                      {errors.carousels?.[index]?.textColor?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`carousels.${index}.url`}
                render={({ field }) => (
                  <FormItem>
                    {index == 0 && <FormLabel>Url</FormLabel>}
                    <FormControl>
                      <Input {...field} placeholder='Url' />
                    </FormControl>
                    <FormMessage>
                      {errors.carousels?.[index]?.url?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`carousels.${index}.buttonCaption`}
                render={({ field }) => (
                  <FormItem>
                    {index == 0 && <FormLabel>Caption</FormLabel>}
                    <FormControl>
                      <Input {...field} placeholder='buttonCaption' />
                    </FormControl>
                    <FormMessage>
                      {errors.carousels?.[index]?.buttonCaption?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />

              <div>
                <FormField
                  control={form.control}
                  name={`carousels.${index}.image`}
                  render={({ field }) => (
                    <FormItem>
                      {index == 0 && <FormLabel>Image</FormLabel>}

                      <FormControl>
                        <Input placeholder='Enter image url' {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watch(`carousels.${index}.image`) && (
                  <Image
                    src={watch(`carousels.${index}.image`)}
                    alt='image'
                    className=' w-full object-cover object-center rounded-sm'
                    width={192}
                    height={68}
                  />
                )}
                {!watch(`carousels.${index}.image`) && (
                  <UploadButton
                    endpoint='imageUploader'
                    onClientUploadComplete={(res) => {
                      form.setValue(`carousels.${index}.image`, res[0].url)
                    }}
                    onUploadError={(error: Error) => {
                      toast({
                        variant: 'destructive',
                        description: `ERROR! ${error.message}`,
                      })
                    }}
                  />
                )}
              </div>
              <div>
                {index == 0 && <div>Action</div>}
                <Button
                  type='button'
                  disabled={fields.length === 1}
                  variant='outline'
                  className={index == 0 ? 'mt-2' : ''}
                  onClick={() => {
                    remove(index)
                  }}
                >
                  <TrashIcon className='w-4 h-4' />
                </Button>
              </div>
            </div>
          ))}

          <Button
            type='button'
            variant={'outline'}
            onClick={() =>
              append({
                url: '',
                title: '',
                image: '',
                buttonCaption: '',
                textColor: '#FFFFFF', // Default to white for better visibility on carousel images
                isPublished: true
              }, {
                shouldFocus: false
              })
            }
          >
            Add Carousel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

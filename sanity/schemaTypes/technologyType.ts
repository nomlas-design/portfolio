import { defineField, defineType } from 'sanity';

export const technologyType = defineType({
  name: 'technology',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string' }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'name' },
    }),
    defineField({ name: 'icon', type: 'image' }),
  ],
});

import { defineField, defineType, defineArrayMember } from 'sanity';

const gridPositions = Array.from({ length: 12 }, (_, i) => ({
  title: `Position ${i + 1}`,
  value: i + 1,
}));

export const projectType = defineType({
  name: 'project',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string' }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
    }),
    defineField({
      name: 'hierarchy',
      type: 'number',
      validation: (Rule) => Rule.required().positive().integer(),
    }),
    defineField({
      name: 'technologies',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'technology' }] }],
    }),
    defineField({
      name: 'about',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
    }),
    defineField({ name: 'websiteUrl', type: 'url' }),
    defineField({
      name: 'mainImage',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'gallery',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'image',
              type: 'image',
              options: { hotspot: true },
            }),
            defineField({
              name: 'gridPosition',
              type: 'number',
              options: {
                list: gridPositions,
                layout: 'radio',
              },
              validation: (Rule) =>
                Rule.custom((position, context) => {
                  const gallery = context.document?.gallery || [];
                  const usedPositions = gallery
                    .filter((item) => item._key !== context.parent._key)
                    .map((item) => item.gridPosition);
                  return usedPositions.includes(position)
                    ? 'This position is already taken'
                    : true;
                }),
            }),
          ],
        },
      ],
    }),
    defineField({ name: 'client', type: 'string' }),
  ],
});

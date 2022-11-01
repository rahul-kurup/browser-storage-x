import TreeView from 'lib-components/tree-view';

export default function TreeViewTest() {
  return (
    <TreeView
      enableSelection={true}
      showGuidelines={true}
      items={[
        {
          name: 'vehicle',
          items: [
            {
              name: 'car',
              items: [
                {
                  name: 'hyundai',
                  items: [
                    { name: 'i10' },
                    { name: 'i20' },
                    { name: 'i30' },
                    { name: 'verna' },
                  ],
                },
                {
                  name: 'tata',
                  items: [
                    { name: 'punch' },
                    { name: 'tiago' },
                    { name: 'nexon' },
                    { name: 'safari' },
                  ],
                },
                {
                  name: 'mahindra',
                  items: [
                    { name: 'kuv 300' },
                    { name: 'xuv 300' },
                    { name: 'xuv 500' },
                    { name: 'xuv 700' },
                  ],
                },
                {
                  name: 'audi',
                  items: [{ name: 'q4' }, { name: 'a4' }, { name: 's5' }],
                },
              ],
            },
          ],
        },
        {
          name: 'mobile',
          items: [
            {
              name: 'apple',
              items: [
                {
                  name: '12',
                  items: [
                    { name: 'pro' },
                    { name: 'pro max' },
                    { name: 'mini' },
                  ],
                },
                {
                  name: '13',
                  items: [
                    { name: 'mini' },
                    { name: 'pro' },
                    { name: 'pro max' },
                  ],
                },
              ],
            },
            {
              name: 'samsung',
              items: [
                {
                  name: 's22',
                  items: [{ name: 'edge' }, { name: 'ultra' }],
                },
                {
                  name: 's23',
                  items: [{ name: 'ultra' }, { name: 'note' }],
                },
              ],
            },
          ],
        },
      ]}
    />
  );
}

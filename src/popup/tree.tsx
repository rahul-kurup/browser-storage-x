import TreeView from 'lib-components/tree-view';

export default function TreeViewTest() {
  return (
    <TreeView
      nodes={[
        {
          name: 'vehicle',
          nodes: [
            {
              name: 'car',
              nodes: [
                {
                  name: 'hyundai',
                  nodes: [
                    { name: 'i10' },
                    { name: 'i20' },
                    { name: 'i30' },
                    { name: 'verna' },
                  ],
                },
                {
                  name: 'tata',
                  nodes: [
                    { name: 'punch' },
                    { name: 'tiago' },
                    { name: 'nexon' },
                    { name: 'safari' },
                  ],
                },
                {
                  name: 'mahindra',
                  nodes: [
                    { name: 'kuv 300' },
                    { name: 'xuv 300' },
                    { name: 'xuv 500' },
                    { name: 'xuv 700' },
                  ],
                },
                {
                  name: 'audi',
                  nodes: [{ name: 'q4' }, { name: 'a4' }, { name: 's5' }],
                },
              ],
            },
          ],
        },
        {
          name: 'mobile',
          nodes: [
            {
              name: 'apple',
              nodes: [
                {
                  name: '12',
                  nodes: [
                    { name: 'pro' },
                    { name: 'pro max' },
                    { name: 'mini' },
                  ],
                },
                {
                  name: '13',
                  nodes: [
                    { name: 'mini' },
                    { name: 'pro' },
                    { name: 'pro max' },
                  ],
                },
              ],
            },
            {
              name: 'samsung',
              nodes: [
                {
                  name: 's22',
                  nodes: [{ name: 'edge' }, { name: 'ultra' }],
                },
                {
                  name: 's23',
                  nodes: [{ name: 'ultra' }, { name: 'node' }],
                },
              ],
            },
          ],
        },
      ]}
    />
  );
}

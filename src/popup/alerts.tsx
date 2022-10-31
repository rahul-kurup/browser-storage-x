import { Alert } from '@mantine/core';
import { Progress } from 'lib-models/progress';

const alerts = {
  [Progress.started]: (
    <Alert color='blue' title='🔁 Sharing'>
      Storage is being transferred...
    </Alert>
  ),

  [Progress.stopped]: (
    <Alert color='blue' title='⏹ No change'>
      No data found to be transferred
    </Alert>
  ),

  [Progress.pass]: (
    <Alert color='green' title='✅ Done'>
      Storage transfer completed!
    </Alert>
  ),

  [Progress.fail]: (
    <Alert color='red' title='❌ Some error occurred'>
      You may share the logged error in console with the extension author
    </Alert>
  ),

  [Progress.abort]: (
    <Alert color='red' title='🛑 Aborted'>
      Aborted
    </Alert>
  ),
};

export default alerts;

import React, { useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import { SuccessDialog, WarningDialog, ErrorDialog } from './DialogBoxes';

const DialogDemo = () => {
  // State for controlling dialog visibility
  const [successOpen, setSuccessOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Dialog Box Examples</Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 4 }}>
        <Button 
          variant="contained" 
          color="success" 
          onClick={() => setSuccessOpen(true)}
        >
          Show Success Dialog
        </Button>
        
        <Button 
          variant="contained" 
          color="warning" 
          onClick={() => setWarningOpen(true)}
        >
          Show Warning Dialog
        </Button>
        
        <Button 
          variant="contained" 
          color="error" 
          onClick={() => setErrorOpen(true)}
        >
          Show Error Dialog
        </Button>
      </Box>
      
      {/* Success Dialog */}
      <SuccessDialog
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Operation Successful"
        message="Your transaction has been successfully processed."
        confirmButtonText="Great!"
      />
      
      {/* Warning Dialog */}
      <WarningDialog
        open={warningOpen}
        onClose={() => setWarningOpen(false)}
        title="Warning"
        message="This action will apply to all selected items. Are you sure you want to continue?"
        confirmButtonText="Continue"
        cancelButtonText="Cancel"
        onConfirm={() => console.log('Warning action confirmed')}
      />
      
      {/* Error Dialog */}
      <ErrorDialog
        open={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Error Occurred"
        message="There was an error processing your request. Please try again later."
        confirmButtonText="OK"
      />
    </Box>
  );
};

export default DialogDemo; 
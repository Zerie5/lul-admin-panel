import React from 'react';
import { Card, CardHeader, CardContent, Divider, IconButton, Box } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import DownloadIcon from '@mui/icons-material/Download';
import ReportStateHandler from './ReportStateHandler';
import { ResponsiveContainer } from 'recharts';

interface ReportChartProps {
  title: string;
  data: any[];
  isLoading: boolean;
  error: Error | null;
  type: string;
  onExport: (event: any, data: any[], type: string, title: string) => void;
  children: React.ReactNode;
  emptyMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
}

const ReportChart = ({
  title,
  data,
  isLoading,
  error,
  type,
  onExport,
  children,
  emptyMessage,
  errorMessage,
  onRetry
}: ReportChartProps) => {
  const isEmpty = !data || data.length === 0;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={title}
        action={
          <Box>
            <Tooltip title="Export">
              <IconButton 
                onClick={(e) => onExport(e, data, type, title)}
                disabled={isLoading || !!error || isEmpty}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      <Divider />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 0 }}>
        <ReportStateHandler
          isLoading={isLoading}
          error={error}
          isEmpty={isEmpty}
          emptyMessage={emptyMessage}
          errorMessage={errorMessage}
          onRetry={onRetry}
        >
          <Box sx={{ width: '100%', height: 300, p: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              {children}
            </ResponsiveContainer>
          </Box>
        </ReportStateHandler>
      </CardContent>
    </Card>
  );
};

export default ReportChart; 
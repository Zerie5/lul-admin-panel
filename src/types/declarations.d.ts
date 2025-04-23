// This file contains declarations for modules without TypeScript definitions

declare module 'react' {
  export type ReactNode = 
    | ReactElement
    | string
    | number
    | boolean
    | null
    | undefined
    | ReactNodeArray;
  
  export interface ReactNodeArray extends Array<ReactNode> {}
  
  export type FC<P = {}> = FunctionComponent<P>;
  export interface FunctionComponent<P = {}> {
    (props: P & { children?: ReactNode }): ReactElement | null;
  }
  
  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }
  
  export type Key = string | number;
  export type JSXElementConstructor<P> = (props: P) => ReactElement | null;
  
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: ReadonlyArray<any>): void;
  export function useContext<T>(context: React.Context<T>): T;
  export function createContext<T>(defaultValue: T): React.Context<T>;
  
  export interface Context<T> {
    Provider: Provider<T>;
    Consumer: Consumer<T>;
    displayName?: string;
  }
  
  export interface Provider<T> {
    (props: { value: T; children?: ReactNode }): ReactElement | null;
  }
  
  export interface Consumer<T> {
    (props: { children: (value: T) => ReactNode }): ReactElement | null;
  }
  
  export function createElement(type: any, props?: any, ...children: any[]): ReactElement;
  export function Fragment(props: { children?: ReactNode }): ReactElement | null;
  export function StrictMode(props: { children?: ReactNode }): ReactElement | null;
}

declare module 'react-dom/client' {
  export function createRoot(container: Element | DocumentFragment): {
    render(element: React.ReactNode): void;
    unmount(): void;
  };
}

declare module 'react-router-dom' {
  export interface RouteProps {
    path?: string;
    exact?: boolean;
    element?: React.ReactNode;
    children?: React.ReactNode;
    index?: boolean;
  }

  export function BrowserRouter(props: { children: React.ReactNode }): JSX.Element;
  export function Routes(props: { children: React.ReactNode }): JSX.Element;
  export function Route(props: RouteProps): JSX.Element;
  export function Navigate(props: { to: string; replace?: boolean }): JSX.Element;
  export function Outlet(): JSX.Element;
  export function useNavigate(): (path: string, options?: { replace?: boolean }) => void;
  export function useLocation(): { pathname: string; search: string; hash: string; state: any };
  export function useParams<T = {}>(): T;
}

declare module '@mui/material' {
  export const Box: any;
  export const Button: any;
  export const Container: any;
  export const Paper: any;
  export const Typography: any;
  export const CssBaseline: any;
  export const Drawer: any;
  export const AppBar: any;
  export const Toolbar: any;
  export const List: any;
  export const Divider: any;
  export const IconButton: any;
  export const ListItem: any;
  export const ListItemButton: any;
  export const ListItemIcon: any;
  export const ListItemText: any;
  export const Avatar: any;
  export const Menu: any;
  export const MenuItem: any;
  export const TextField: any;
  export const Alert: any;
  export const InputAdornment: any;
  export const CircularProgress: any;
  export const Card: any;
  export const CardContent: any;
  export const CardHeader: any;
  export const Grid: any;
  export const Snackbar: any;
  export const Chip: any;
  export const Dialog: any;
  export const DialogActions: any;
  export const DialogContent: any;
  export const DialogContentText: any;
  export const DialogTitle: any;
  export const TableContainer: any;
  export const Table: any;
  export const TableHead: any;
  export const TableBody: any;
  export const TableRow: any;
  export const TableCell: any;
  export const TablePagination: any;
  export const FormControl: any;
  export const FormHelperText: any;
  export const InputLabel: any;
  export const Select: any;
  export const Tab: any;
  export const Tabs: any;
  export function useTheme(): any;
  export function useMediaQuery(query: any): boolean;
}

declare module '@mui/material/styles' {
  export function createTheme(options: any): any;
  export function ThemeProvider(props: { theme: any; children: React.ReactNode }): JSX.Element;
}

declare module '@mui/icons-material' {
  export const Menu: any;
  export const Dashboard: any;
  export const People: any;
  export const Settings: any;
  export const AccountCircle: any;
  export const Logout: any;
  export const ChevronLeft: any;
  export const Visibility: any;
  export const VisibilityOff: any;
  export const PeopleAlt: any;
  export const AttachMoney: any;
  export const ShoppingCart: any;
  export const TrendingUp: any;
  export const Add: any;
  export const Edit: any;
  export const Delete: any;
  export const Search: any;
}

declare module 'recharts' {
  export const BarChart: any;
  export const Bar: any;
  export const XAxis: any;
  export const YAxis: any;
  export const CartesianGrid: any;
  export const Tooltip: any;
  export const Legend: any;
  export const ResponsiveContainer: any;
  export const LineChart: any;
  export const Line: any;
  export const PieChart: any;
  export const Pie: any;
  export const Cell: any;
}

declare module 'jwt-decode' {
  export function jwtDecode<T = any>(token: string): T;
}

declare module '@reduxjs/toolkit' {
  export function configureStore(options: any): any;
  export function createSlice(options: any): any;
  export interface PayloadAction<P = void, T extends string = string, M = never, E = never> {
    payload: P;
    type: T;
  }
}

declare module 'react-redux' {
  export function useDispatch(): any;
  export function useSelector<TState = any, TSelected = any>(
    selector: (state: TState) => TSelected,
    equalityFn?: (left: TSelected, right: TSelected) => boolean
  ): TSelected;
  export function Provider(props: { store: any; children: React.ReactNode }): JSX.Element;
}

declare module '@tanstack/react-query' {
  export class QueryClient {
    constructor(config?: any);
  }
  export function QueryClientProvider(props: { client: any; children: React.ReactNode }): JSX.Element;
}

declare module 'formik' {
  export const Formik: any;
  export const Form: any;
  export const Field: any;
  export const ErrorMessage: any;
  export function useFormik(config: any): any;
}

declare module 'yup' {
  export function object(schema: any): any;
  export function string(): any;
  export function number(): any;
  export function boolean(): any;
  export function date(): any;
  export function array(): any;
}

declare module 'axios' {
  interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: any;
  }

  interface AxiosInstance {
    get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>>;
    post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>>;
    put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>>;
    delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>>;
    interceptors: {
      request: {
        use: (onFulfilled?: any, onRejected?: any) => number;
      };
      response: {
        use: (onFulfilled?: any, onRejected?: any) => number;
      };
    };
  }

  const axios: AxiosInstance;
  export default axios;
} 
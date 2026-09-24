import { type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CircleHelp,
  CirclePlus,
  Code2,
  GitBranch,
  ListTree,
  Play,
  RotateCcw,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  Undo2,
} from 'lucide-react';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();
const INITIAL_LIST = [12, 24, 37, 51, 68];

type Operation = 'append' | 'prepend' | 'insert' | 'delete' | 'search' | 'reverse' | 'reset';

type OperationMeta = {
  label: string;
  hint: string;
  icon: typeof CirclePlus;
  complexity: string;
  space: string;
};

const OPERATIONS: Record<Operation, OperationMeta> = {
  append: { label: 'Append', hint: 'Add to tail', icon: CirclePlus, complexity: 'O(n)', space: 'O(1)' },
  prepend: { label: 'Prepend', hint: 'Add to head', icon: ArrowLeft, complexity: 'O(1)', space: 'O(1)' },
  insert: { label: 'Insert', hint: 'Place at index', icon: ArrowUpRight, complexity: 'O(n)', space: 'O(1)' },
  delete: { label: 'Delete', hint: 'Remove by value', icon: Trash2, complexity: 'O(n)', space: 'O(1)' },
  search: { label: 'Search', hint: 'Find a value', icon: Search, complexity: 'O(n)', space: 'O(1)' },
  reverse: { label: 'Reverse', hint: 'Flip pointers', icon: Undo2, complexity: 'O(n)', space: 'O(1)' },
  reset: { label: 'Reset', hint: 'Restore example', icon: RotateCcw, complexity: 'O(n)', space: 'O(1)' },
};

const operationOrder: Operation[] = ['append', 'prepend', 'insert', 'delete', 'search', 'reverse', 'reset'];

function isNumber(value: string) {
  return value.trim() !== '' && Number.isFinite(Number(value));
}

function AppHeader() {
  return (
    <header className="lab-content mx-auto flex w-full max-w-[1420px] items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--background))] shadow-[4px_4px_0_hsl(var(--accent))]" data-testid="brand-mark">
          <GitBranch size={21} strokeWidth={2.4} />
        </div>
        <div>
          <div className="display-font text-[1.05rem] font-bold tracking-[-0.04em]">Linked List Lab</div>
          <div className="eyebrow mt-0.5">visual data structures</div>
        </div>
      </div>
      <div className="hidden items-center gap-5 sm:flex">
        <div className="flex items-center gap-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
          <span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-3))]" />
          Practice session <span className="mono-font text-[hsl(var(--foreground))]">#04</span>
        </div>
        <button className="action-button action-quiet min-h-9 px-3" data-testid="button-help">
          <CircleHelp size={15} />
          How it works
        </button>
      </div>
    </header>
  );
}

function OperationRail({
  selected,
  onSelect,
}: {
  selected: Operation;
  onSelect: (operation: Operation) => void;
}) {
  return (
    <aside className="fade-up panel rounded-2xl p-3 sm:p-4" data-testid="operation-rail">
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="eyebrow">operations</span>
        <Settings2 size={15} className="text-[hsl(var(--muted-foreground))]" />
      </div>
      <div className="operation-rail">
        {operationOrder.map((operation) => {
          const meta = OPERATIONS[operation];
          const Icon = meta.icon;
          return (
            <button
              key={operation}
              className={`operation-tab ${selected === operation ? 'is-selected' : ''}`}
              onClick={() => onSelect(operation)}
              data-testid={`button-operation-${operation}`}
              aria-pressed={selected === operation}
            >
              <span className="operation-tab-icon"><Icon size={16} /></span>
              <span className="min-w-0">
                <span className="block text-[0.76rem] font-extrabold">{meta.label}</span>
                <span className="mt-0.5 block truncate text-[0.64rem]">{meta.hint}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 hidden border-t border-[hsl(var(--border))] px-1 pt-4 lg:block">
        <span className="eyebrow">lab note</span>
        <p className="mt-2 text-[0.73rem] leading-5 text-[hsl(var(--muted-foreground))]">
          Watch the current pointer move before you memorize the syntax.
        </p>
      </div>
    </aside>
  );
}

function NodeTrack({ nodes, activeIndexes }: { nodes: number[]; activeIndexes: number[] }) {
  return (
    <div className="node-track" data-testid="display-linked-list">
      {nodes.length === 0 ? (
        <div className="flex min-h-[6rem] w-full flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] bg-[rgba(243,233,215,0.45)] text-center">
          <div className="mono-font text-xs text-[hsl(var(--muted-foreground))]">head → null</div>
          <div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">An empty list is still a list. Add a node to begin.</div>
        </div>
      ) : (
        <>
          {nodes.map((node, index) => (
            <div className="flex items-center gap-2" key={`${node}-${index}`}>
              <div
                className={`node-card ${activeIndexes.includes(index) ? 'is-active' : ''}`}
                data-testid={`node-card-${index}`}
              >
                <div className="flex items-center justify-between">
                  <span className="node-index">node_{index}</span>
                  {index === 0 && <span className="rounded-full bg-[rgba(247,126,73,0.13)] px-1.5 py-0.5 text-[0.56rem] font-bold uppercase tracking-wider text-[hsl(var(--accent))]">head</span>}
                </div>
                <div className="node-value" data-testid={`node-value-${index}`}>{node}</div>
                <div className="node-next">
                  <span>next</span>
                  <span>{index === nodes.length - 1 ? 'null' : `node_${index + 1}`}</span>
                </div>
              </div>
              {index < nodes.length - 1 && (
                <div className="pointer-arrow" aria-hidden="true">
                  <ArrowRight size={23} strokeWidth={1.7} />
                </div>
              )}
            </div>
          ))}
          <div className="null-node">→ null</div>
        </>
      )}
    </div>
  );
}

function OperationForm({
  operation,
  value,
  setValue,
  index,
  setIndex,
  onRun,
}: {
  operation: Operation;
  value: string;
  setValue: (value: string) => void;
  index: string;
  setIndex: (value: string) => void;
  onRun: () => void;
}) {
  const meta = OPERATIONS[operation];
  const noInput = operation === 'reverse' || operation === 'reset';
  return (
    <div className="border-t border-[hsl(var(--border))] px-4 py-4 sm:px-5" data-testid="operation-form">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {operation === 'insert' ? (
          <>
            <label className="block flex-1">
              <span className="field-label">value</span>
              <input className="field" type="number" value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && onRun()} data-testid="input-operation-value" />
            </label>
            <label className="block flex-1">
              <span className="field-label">index <span className="font-normal">(zero-based)</span></span>
              <input className="field" type="number" min="0" value={index} onChange={(event) => setIndex(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && onRun()} data-testid="input-operation-index" />
            </label>
          </>
        ) : noInput ? (
          <div className="flex-1 rounded-lg bg-[rgba(243,233,215,0.6)] px-3 py-3 text-xs text-[hsl(var(--muted-foreground))]">
            {operation === 'reset' ? 'Return the list to the starting example.' : 'No parameters needed. This operation works on the whole list.'}
          </div>
        ) : (
          <label className="block flex-1">
            <span className="field-label">{operation === 'search' || operation === 'delete' ? 'value to find' : 'new node value'}</span>
            <input className="field" type="number" value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && onRun()} data-testid="input-operation-value" />
          </label>
        )}
        <button className={`action-button ${operation === 'reset' ? 'action-quiet' : 'action-primary'} sm:min-w-[126px]`} onClick={onRun} data-testid={`button-run-${operation}`}>
          {operation === 'reset' ? <RotateCcw size={15} /> : <Play size={15} fill="currentColor" />}
          {operation === 'reset' ? 'Restore' : `Run ${meta.label}`}
        </button>
      </div>
    </div>
  );
}

function StepsPanel({ operation, nodes, activeIndexes, compact }: { operation: Operation; nodes: number[]; activeIndexes: number[]; compact: boolean }) {
  const meta = OPERATIONS[operation];
  const target = activeIndexes[0];
  const value = target !== undefined ? nodes[target] : undefined;
  const allSteps: string[] = operation === 'append'
    ? [`Start at head and follow next until the pointer is null.`, `Reach the tail node (${nodes[nodes.length - 1] ?? 'empty'}) and allocate a new node.`, `Set tail.next to the new node. Its next pointer stays null.`]
    : operation === 'prepend'
      ? [`Allocate a fresh node with the value.`, `Point newNode.next at the current head (${nodes[0] ?? 'null'}).`, `Move head to newNode. The rest of the chain stays connected.`]
      : operation === 'insert'
        ? [`Walk from head until the node before the target index.`, `Hold the old next pointer before changing anything.`, `Connect the new node between its neighbors.`]
        : operation === 'delete'
          ? [`Start at head and compare each node's value.`, `When a match appears, keep the previous node in view.`, `Bypass the match: previous.next now points to current.next.`]
          : operation === 'search'
            ? [`Set a cursor to head and inspect one value at a time.`, `Move cursor along next until the value matches or we hit null.`, value !== undefined ? `Match found at index ${target}. Stop and report the node.` : `No match yet. A null pointer means the value is not in this list.`]
            : operation === 'reverse'
              ? [`Keep three pointers: previous, current, and next.`, `Save current.next, then turn current.next backward to previous.`, `Advance all pointers until current is null; previous becomes head.`]
              : [`Discard the current chain from the practice board.`, `Load the original five-node example.`, `The list is ready for another experiment.`];
  const shownSteps = compact ? allSteps.slice(0, 2) : allSteps;
  return (
    <section className="panel rounded-2xl p-4 sm:p-5" data-testid="explanation-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="eyebrow">algorithm trace</span>
          <h2 className="display-font mt-1 text-lg font-bold tracking-[-0.03em]">{meta.label} in motion</h2>
        </div>
        <Code2 size={18} className="text-[hsl(var(--accent))]" />
      </div>
      <div className="mt-3">
        {shownSteps.map((step, index) => (
          <div className={`step-row ${index === Math.min(activeIndexes.length, 2) ? 'is-current' : ''}`} key={step} data-testid={`step-${index}`}>
            <span className="step-number">{index + 1}</span>
            <p className="step-copy m-0">{step}</p>
          </div>
        ))}
      </div>
      {compact && (
        <p className="mt-3 text-[0.68rem] text-[hsl(var(--muted-foreground))]">
          Expanded mode shows the full pointer choreography.
        </p>
      )}
    </section>
  );
}

function ComplexityPanel({ operation }: { operation: Operation }) {
  const meta = OPERATIONS[operation];
  return (
    <section className="complexity-panel panel rounded-2xl p-4 sm:p-5" data-testid="complexity-panel">
      <div className="flex items-center justify-between">
        <span className="eyebrow">performance</span>
        <Sparkles size={17} className="text-[hsl(var(--accent))]" />
      </div>
      <h2 className="display-font mt-1 text-lg font-bold tracking-[-0.03em]">{meta.label}</h2>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-[hsl(var(--secondary))] p-3">
          <div className="eyebrow">time</div>
          <div className="mono-font mt-2 text-xl font-medium">{meta.complexity}</div>
        </div>
        <div className="rounded-xl bg-[hsl(var(--secondary))] p-3">
          <div className="eyebrow">space</div>
          <div className="mono-font mt-2 text-xl font-medium">{meta.space}</div>
        </div>
      </div>
      <div className="mt-4 border-t border-dashed border-[hsl(var(--border))] pt-3">
        <p className="m-0 text-[0.72rem] leading-5 text-[hsl(var(--muted-foreground))]">
          {operation === 'prepend' ? 'The head is already in hand, so insertion is instant.' : operation === 'search' ? 'A singly linked list has no backward shortcut. The cursor may inspect every node.' : 'The chain is traversed one pointer at a time; memory stays constant while links are rewired.'}
        </p>
      </div>
      <div className="mt-4 flex items-center gap-2 text-[0.68rem] text-[hsl(var(--muted-foreground))]">
        <span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-3))]" />
        Constant extra memory
      </div>
    </section>
  );
}

function Home() {
  const [nodes, setNodes] = useState<number[]>(INITIAL_LIST);
  const [operation, setOperation] = useState<Operation>('append');
  const [value, setValue] = useState('76');
  const [index, setIndex] = useState('2');
  const [activeIndexes, setActiveIndexes] = useState<number[]>([]);
  const [message, setMessage] = useState('The list is ready. Pick an operation and watch the pointers work.');
  const [error, setError] = useState(false);
  const [compact, setCompact] = useState(false);

  const runOperation = () => {
    setError(false);
    if (operation === 'reset') {
      setNodes(INITIAL_LIST);
      setActiveIndexes([]);
      setMessage('Example restored: 12 → 24 → 37 → 51 → 68.');
      return;
    }
    if (operation === 'reverse') {
      setNodes((current) => [...current].reverse());
      setActiveIndexes(nodes.length ? [0] : []);
      setMessage(nodes.length ? 'Pointers reversed. The old tail is now the new head.' : 'The list is empty, so there is nothing to reverse.');
      return;
    }
    if (!isNumber(value)) {
      setError(true);
      setMessage('Enter a number before running this operation.');
      return;
    }
    const parsedValue = Number(value);
    if (operation === 'append') {
      setNodes((current) => [...current, parsedValue]);
      setActiveIndexes([nodes.length]);
      setMessage(`Appended ${parsedValue} to the tail. Its next pointer is null.`);
      return;
    }
    if (operation === 'prepend') {
      setNodes((current) => [parsedValue, ...current]);
      setActiveIndexes([0]);
      setMessage(`Prepended ${parsedValue}. Head now points to the new first node.`);
      return;
    }
    if (operation === 'insert') {
      if (!isNumber(index) || Number(index) < 0 || Number(index) > nodes.length || !Number.isInteger(Number(index))) {
        setError(true);
        setMessage(`Index must be a whole number from 0 to ${nodes.length}.`);
        return;
      }
      const targetIndex = Number(index);
      setNodes((current) => [...current.slice(0, targetIndex), parsedValue, ...current.slice(targetIndex)]);
      setActiveIndexes([targetIndex]);
      setMessage(`Inserted ${parsedValue} at index ${targetIndex}. Both neighboring links are connected.`);
      return;
    }
    const targetIndex = nodes.indexOf(parsedValue);
    if (operation === 'search') {
      setActiveIndexes(targetIndex === -1 ? [] : [targetIndex]);
      setError(targetIndex === -1);
      setMessage(targetIndex === -1 ? `${parsedValue} is not in this list. The cursor reached null.` : `Found ${parsedValue} at index ${targetIndex}. The cursor can stop here.`);
      return;
    }
    if (operation === 'delete') {
      if (targetIndex === -1) {
        setError(true);
        setActiveIndexes([]);
        setMessage(`${parsedValue} is not in this list, so no links changed.`);
        return;
      }
      setNodes((current) => current.filter((_, nodeIndex) => nodeIndex !== targetIndex));
      setActiveIndexes(targetIndex > 0 ? [targetIndex - 1] : []);
      setMessage(`Deleted the first ${parsedValue}. The previous node now skips over it.`);
    }
  };

  return (
    <div className="lab-shell">
      <AppHeader />
      <main className="lab-content mx-auto w-full max-w-[1420px] px-5 pb-12 sm:px-8 lg:px-10">
        <section className="fade-up mb-8 flex flex-col justify-between gap-6 border-b border-[hsl(var(--border))] pb-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="eyebrow flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" /> practice room / singly linked list</div>
            <h1 className="display-font mt-3 max-w-2xl text-[clamp(2.65rem,6vw,5.5rem)] font-bold leading-[0.94] tracking-[-0.075em]">
              See the pointer.<br /><span className="text-[hsl(var(--accent))]">Get the idea.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">
              A hands-on lab for the moment a linked list stops being abstract. Run one operation, follow each link, and build the mental model node by node.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-start rounded-full border border-[hsl(var(--border))] bg-[rgba(255,253,247,0.58)] p-1 lg:self-end" data-testid="mode-switcher">
            <button className={`mode-button rounded-full ${compact ? '' : 'is-active bg-[hsl(var(--secondary))]'}`} onClick={() => setCompact(false)} data-testid="button-expanded-mode">Expanded</button>
            <button className={`mode-button rounded-full ${compact ? 'is-active bg-[hsl(var(--secondary))]' : ''}`} onClick={() => setCompact(true)} data-testid="button-compact-mode">Compact</button>
          </div>
        </section>

        <div className="lab-grid">
          <OperationRail selected={operation} onSelect={(next) => { setOperation(next); setError(false); setActiveIndexes([]); }} />

          <div className="fade-up delay-1 min-w-0 space-y-4">
            <section className="panel overflow-hidden rounded-2xl" data-testid="workspace-panel">
              <div className="flex flex-col gap-4 border-b border-[hsl(var(--border))] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="eyebrow">your structure</span>
                    <span className="divider-dot eyebrow">{nodes.length} nodes</span>
                  </div>
                  <h2 className="display-font mt-1 text-xl font-bold tracking-[-0.04em]">Singly linked list</h2>
                </div>
                <div className="mono-font flex items-center gap-2 text-[0.68rem] text-[hsl(var(--muted-foreground))]">
                  <span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-3))]" />
                  head <ArrowRight size={13} /> tail
                </div>
              </div>
              <div className="px-4 sm:px-5">
                <NodeTrack nodes={nodes} activeIndexes={activeIndexes} />
              </div>
              <OperationForm operation={operation} value={value} setValue={setValue} index={index} setIndex={setIndex} onRun={runOperation} />
            </section>

            <div className={`result-banner rounded-lg ${error ? 'is-error' : ''}`} data-testid="status-message" aria-live="polite">
              <div className="mt-0.5">{error ? <CircleHelp size={16} /> : <Sparkles size={16} />}</div>
              <div>
                <div className="eyebrow">{error ? 'needs a nudge' : 'latest result'}</div>
                <p className="mt-1 text-xs leading-5">{message}</p>
              </div>
            </div>

            <StepsPanel operation={operation} nodes={nodes} activeIndexes={activeIndexes} compact={compact} />
          </div>

          <div className="fade-up delay-2 space-y-4">
            <ComplexityPanel operation={operation} />
            <section className="panel rounded-2xl p-4 sm:p-5" data-testid="mental-model-panel">
              <div className="flex items-center gap-2">
                <ListTree size={17} className="text-[hsl(var(--accent))]" />
                <span className="eyebrow">mental model</span>
              </div>
              <p className="mt-3 text-sm font-semibold leading-6">
                Every node knows one thing: where the next node lives.
              </p>
              <div className="mono-font mt-4 rounded-lg bg-[hsl(var(--primary))] p-3 text-[0.68rem] leading-6 text-[hsl(var(--primary-foreground))]">
                <div><span className="text-[hsl(var(--accent))]">node</span> = value + next</div>
                <div><span className="text-[hsl(var(--accent))]">head</span> → node_0</div>
                <div><span className="text-[hsl(var(--accent))]">tail.next</span> → null</div>
              </div>
              <div className="mt-4 flex items-start gap-2 text-[0.69rem] leading-5 text-[hsl(var(--muted-foreground))]">
                <ArrowRight size={14} className="mt-0.5 shrink-0 text-[hsl(var(--accent))]" />
                <span>Follow the orange arrows. They are the only path through the structure.</span>
              </div>
            </section>
          </div>
        </div>

        <footer className="mt-10 flex flex-col justify-between gap-3 border-t border-[hsl(var(--border))] pt-5 text-[0.68rem] text-[hsl(var(--muted-foreground))] sm:flex-row">
          <div className="mono-font">LLL / build your intuition</div>
          <div className="flex items-center gap-3"><span>Client-side practice</span><span className="h-1 w-1 rounded-full bg-[hsl(var(--accent))]" /><span>Nothing leaves this room</span></div>
        </footer>
      </main>
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
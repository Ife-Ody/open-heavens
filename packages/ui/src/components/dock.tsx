'use client';

import { cn } from '@repo/ui/lib/utils';
import { BookOpenIcon, BookPlusIcon, MusicIcon } from 'lucide-react';
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
} from 'motion/react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const DOCK_HEIGHT = 128;
const DEFAULT_MAGNIFICATION = 80;
const DEFAULT_DISTANCE = 150;
const DEFAULT_PANEL_HEIGHT = 64;
const bottomDockItems = [
  { label: 'Devotional', href: '/', icon: BookOpenIcon },
  { label: 'Bible', href: '/bible', icon: BookPlusIcon },
  { label: 'Hymns', href: '/hymns', icon: MusicIcon },
] as const;

export type DockProps = {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  panelHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
};

export type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
};

export type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
};

export type DockIconProps = {
  className?: string;
  children: React.ReactNode;
};

export type DocContextType = {
  mouseX: MotionValue;
  spring: SpringOptions;
  magnification: number;
  distance: number;
  resetDock: () => void;
};

export type DockProviderProps = {
  children: React.ReactNode;
  value: DocContextType;
};

export type BottomDockProps = {
  className?: string;
};

const DockContext = createContext<DocContextType | undefined>(undefined);

function DockProvider({ children, value }: DockProviderProps) {
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
}

function useDock() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error('useDock must be used within an DockProvider');
  }
  return context;
}

function Dock({
  children,
  className,
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  panelHeight = DEFAULT_PANEL_HEIGHT,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const ishovered = useMotionValue(0);
  const resetDock = () => {
    ishovered.set(0);
    mouseX.set(Infinity);
  };

  const setDockHover = (pageX: number) => {
    ishovered.set(1);
    mouseX.set(pageX);
  };

  const maxHeight = useMemo(() => {
    return Math.max(DOCK_HEIGHT, magnification + magnification / 2 + 4);
  }, [magnification]);

  const heightRow = useTransform(ishovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  return (
    <motion.div
      style={{
        height: height,
        scrollbarWidth: 'none',
      }}
      className='mx-2 flex max-w-full items-end overflow-x-auto'
    >
      <motion.div
        onPointerMove={({ pageX, pointerType }) => {
          if (pointerType !== 'mouse') {
            return;
          }

          setDockHover(pageX);
        }}
        onPointerDown={({ pageX, pointerType }) => {
          if (pointerType === 'mouse') {
            return;
          }

          setDockHover(pageX);
        }}
        onPointerLeave={resetDock}
        onPointerUp={resetDock}
        onPointerCancel={resetDock}
        className={cn(
          'mx-auto flex w-fit gap-4 rounded-2xl bg-muted/50 px-4',
          className
        )}
        style={{ height: panelHeight }}
        role='toolbar'
        aria-label='Application dock'
      >
        <DockProvider
          value={{ mouseX, spring, distance, magnification, resetDock }}
        >
          {children}
        </DockProvider>
      </motion.div>
    </motion.div>
  );
}

function DockItem({ children, className, onClick }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { distance, magnification, mouseX, spring, resetDock } = useDock();

  const ishovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const domRect = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - domRect.x - domRect.width / 2;
  });

  const widthTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [40, magnification, 40]
  );

  const width = useSpring(widthTransform, spring);

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      onHoverStart={() => ishovered.set(1)}
      onHoverEnd={() => ishovered.set(0)}
      onFocus={() => ishovered.set(1)}
      onBlur={() => {
        ishovered.set(0);
        resetDock();
      }}
      className={cn(
        'relative inline-flex items-center justify-center',
        className
      )}
      tabIndex={0}
      role='button'
      aria-haspopup='true'
      onClick={() => {
        resetDock();
        onClick?.();
      }}
    >
      {Children.map(children, (child) =>
        cloneElement(
          child as React.ReactElement<{
            width?: MotionValue<number>;
            ishovered?: MotionValue<number>;
          }>,
          { width, ishovered }
        )
      )}
    </motion.div>
  );
}

function DockLabel({ children, className, ...rest }: DockLabelProps) {
  const restProps = rest as Record<string, unknown>;
  const ishovered = restProps['ishovered'] as MotionValue<number>;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = ishovered.on('change', (latest) => {
      setIsVisible(latest === 1);
    });

    return () => unsubscribe();
  }, [ishovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'absolute -top-6 left-1/2 w-fit whitespace-pre rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground',
            className
          )}
          role='tooltip'
          style={{ x: '-50%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className, ...rest }: DockIconProps) {
  const restProps = rest as Record<string, unknown>;
  const width = restProps['width'] as MotionValue<number>;

  const widthTransform = useTransform(width, (val) => val / 2);

  return (
    <motion.div
      style={{ width: widthTransform }}
      className={cn('flex items-center justify-center', className)}
    >
      {children}
    </motion.div>
  );
}

function BottomDock({ className }: BottomDockProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4',
        className
      )}
    >
      <Dock
        panelHeight={64}
        className='pointer-events-auto border border-border/50 bg-background/90 shadow-lg backdrop-blur-xs rounded-full px-8 gap-8'
      >
        {bottomDockItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === '/'
              ? pathname === '/' ||
                (!pathname.startsWith('/bible') && !pathname.startsWith('/hymns'))
              : pathname.startsWith(href);

          return (
            <DockItem
              key={href}
              onClick={() => router.push(href)}
              className='aspect-square cursor-pointer rounded-xl flex flex-col items-center justify-center'
            >
              <DockIcon
                className={cn(
                  'rounded-xl transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
                >
                <Icon className='size-full' strokeWidth={1.5} aria-hidden='true' />
              </DockIcon>
                <span className='text-[0.625rem]'>{label}</span>
            </DockItem>
          );
        })}
      </Dock>
    </div>
  );
}

export { BottomDock, Dock, DockIcon, DockItem, DockLabel };

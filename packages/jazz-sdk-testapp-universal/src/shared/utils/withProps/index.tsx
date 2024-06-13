/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ComponentType,
  createElement,
  DetailedHTMLFactory,
  DOMFactory,
  FC,
  FunctionComponent,
  ReactHTML,
  ReactNode,
  ReactSVG,
} from 'react';

type Injector<Props, InjectedProps> = (props: Props) => InjectedProps;

type InnerComponent<Props = any> =
  | ComponentType<Props>
  | keyof ReactHTML
  | keyof ReactSVG;

type Enhanced<I, P extends I> = Omit<P & { children?: ReactNode }, keyof I>;

type InnerProps<Component extends InnerComponent<any>> =
  Component extends keyof ReactHTML
    ? ReactHTML[Component] extends DetailedHTMLFactory<infer HTMLProps, any>
      ? HTMLProps
      : Component extends keyof ReactSVG
        ? ReactSVG[Component] extends DOMFactory<infer SVGProps, SVGElement>
          ? SVGProps
          : never
        : never
    : Component extends ComponentType<infer Props>
      ? Props
      : any;

function getDisplayName(Component: InnerComponent<any>): string {
  return typeof Component === 'string'
    ? Component
    : Component.displayName || Component.name || 'Component';
}

function isInjector<OuterProps, InjectedProps>(
  injector: any,
): injector is Injector<OuterProps, InjectedProps> {
  return typeof injector === 'function';
}

export function withProps<
  Component extends InnerComponent,
  ComponentProps extends InnerProps<Component>,
  InjectedProps extends Partial<ComponentProps>,
  OutcomingProps extends Enhanced<InjectedProps, ComponentProps>,
>(
  BaseComponent: Component,
  injected: Injector<ComponentProps, InjectedProps> | InjectedProps,
): FC<OutcomingProps> {
  const EnhancedComponent: FunctionComponent<OutcomingProps> = (props) =>
    createElement(
      BaseComponent,
      Object.assign<ComponentProps, OutcomingProps, InjectedProps>(
        {} as any,
        props,
        isInjector<ComponentProps, InjectedProps>(injected)
          ? injected(props as unknown as ComponentProps)
          : injected,
      ),
    );
  EnhancedComponent.displayName = `WithProps(${getDisplayName(BaseComponent)})`;
  return EnhancedComponent;
}

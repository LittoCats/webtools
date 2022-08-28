/*******************************************************************************
 * @author      : 程巍巍 (littocats@gmail.com)
 * @created     : Wednesday Aug 10, 2022 20:49:40 CST
 *
 * @description : index
 *
 ******************************************************************************/

import {
  useState as useReactState,
  useCallback as useReactCallback,
  useRef as useReactRef,
  useMemo as useReactMemo,
  useContext as useReactContext,
  createContext as createReactContext,
  Context as ReactContext,
} from "react";
import update, { Spec as ISpec } from "immutability-helper";

export function createContext<T>(defaults: T): Context<T> {
  return createReactContext([
    defaults,
    (spec: Spec<T>) => {
      if (spec) console.warn(`Default context value can't be updated.`);
      return defaults;
    },
  ]);
}

export function useContext<T>(Context: Context<T>): State<T>;
export function useContext<T, K1 extends keyof T>(
  Context: Context<T>,
  K1: K1
): State<T[K1]>;
export function useContext<T, K1 extends keyof T, K2 extends keyof T[K1]>(
  Context: Context<T>,
  K1: K1,
  K2: K2
): State<T[K1][K2]>;
export function useContext<
  T,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2]
>(Context: Context<T>, K1: K1, K2: K2, K3: K3): State<T[K1][K2][K3]>;
export function useContext<
  T,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3]
>(Context: Context<T>, K1: K1, K2: K2, K3: K3): State<T[K1][K2][K3][K4]>;
export function useContext(
  Context: any,
  k1?: any,
  k2?: any,
  k3?: any,
  k4?: any
): State<any> {
  const _ = useReactContext(Context);
  const s = _[0],
    d = _[1];
  const state = useReactMemo(() => {
    const K = [k1, k2, k3, k4];
    let state = s;
    for (let i = 0; i < K.length; i++)
      if (K[i] !== undefined) state = state?.[K[i]];
      else break;
    return state;
  }, [s, k1, k2, k3, k4]);

  const dispatch = useReactCallback(
    (spec: any) => {
      const K = [k4, k3, k2, k1];
      if (spec)
        for (let i = 0; i < K.length; i++) {
          if (K[i] === undefined) continue;
          const origin = spec;
          spec = {};
          spec[K[i]] = origin;
        }
      return d(spec);
    },
    [d, k1, k2, k3, k4]
  );

  return useReactMemo(() => [state, dispatch], [state, dispatch]);
}

export function useState<T>(init: T | (() => T)): State<T> {
  const _ = useReactState(init);
  const s = _[0],
    u = _[1];
  const r = useReactRef(s);
  const d = useReactCallback((spec: Spec<T>) => {
    if (spec) {
      const next = update(r.current, spec);
      if (r.current !== next) u((r.current = next));
    }
    return r.current;
  }, []);

  return useReactMemo(() => [s, d], [s, d]);
}

export const Immutable = {
  createContext,
  useContext,
  useState,
  update,
};

export default Immutable;

export namespace Immutable {
  export type Spec<T> = ISpec<T>;
  export type State<T> = [T, Dispatch<T>];
  export type Context<T> = ReactContext<State<T>>;
  export type Dispatch<T> = (spec: Spec<T>)=> T;
}

export type Spec<T> = Immutable.Spec<T>;
export type State<T> = Immutable.State<T>;
export type Context<T> = Immutable.Context<T>;
export type Dispatch<T> = Immutable.Dispatch<T>;

/*******************************************************************************
 * @author      : 程巍巍 (littocats@gmail.com)
 * @created     : Wednesday Aug 10, 2022 20:49:40 CST
 *
 * @description : index
 *
 ******************************************************************************/
import { Context as ReactContext } from "react";
import { Spec } from "immutability-helper";
export declare function createContext<T>(defaults: T): Context<T>;
export declare function useState<T>(init: T | (() => T)): State<T>;
export declare function useContext<T>(Context: Context<T>): State<T>;
export declare function useContext<T, K1 extends keyof T>(Context: Context<T>, K1: K1): State<T[K1]>;
export declare function useContext<T, K1 extends keyof T, K2 extends keyof T[K1]>(Context: Context<T>, K1: K1, K2: K2): State<T[K1][K2]>;
export declare function useContext<T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(Context: Context<T>, K1: K1, K2: K2, K3: K3): State<T[K1][K2][K3]>;
export declare function useContext<T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(Context: Context<T>, K1: K1, K2: K2, K3: K3): State<T[K1][K2][K3][K4]>;
export declare const Immutable: {
    createContext: typeof createContext;
    useState: typeof useState;
    useContext: typeof useContext;
};
export default Immutable;
export declare namespace Immutable {
    type State<T> = [T, (spec: Spec<T>) => T];
    type Context<T> = ReactContext<State<T>>;
}
export declare type State<T> = Immutable.State<T>;
export declare type Context<T> = Immutable.Context<T>;

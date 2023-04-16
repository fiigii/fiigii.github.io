---
title: Hardware intrinsic in .NET Core 3.0 - Introduction
date: 2019-03-03 16:47:03
tags: 
- .NET Core
- x86
- SIMD
description: 
- Introduction to the new APIs of .NET Core 3.0 that allows lower level programming (e.g., SIMD programming) in C#.
---

In the past two years, I worked for Intel Corporation as a compiler engineer. The major project I worked during that period of time is to design and implement the x86 hardware intrinsic for .NET Core. This project was starting with the [design proposal](https://github.com/dotnet/corefx/issues/22940) at 8/2017, and now (3/2019) this feature is fully implemented in the JIT compiler/runtime and ready for release in .NET Core 3.0. That is my first job, I did much more things than what I expected and learned a lot from the open source cooperation. So, I decided to launch an English blog to share what I acquired from the open source work. In the future, I expect that this blog will have articles about compilers, language design, and computer graphics, but now let's start with .NET Core and hardware intrinsics.

## Motivation
Computer science is the fastest developing area in the last 50 years that has made so many fantasies come true. But why? The root reason is that our computer hardware and software become faster and faster at an incredible rate (a.k.a., [Moore's Law](https://en.wikipedia.org/wiki/Moore%27s_law)). As I remember, in my childhood, the most effective strategy of software optimization is "waiting". Just wait for newer CPUs that will run your applications much faster. However, the world is silently changing, and the "free lunch" become more and more expensive. So, computer scientists have looked for new directions to keep this growth rate, or in other words, to save this world. Stronger Data-Level Parallelism (DLP) is one of the mainstream development directions of contemporary general processors. Meanwhile, Single Instruction Multiple Data (SIMD) is the leading model of DLP on modern computer architectures due to its efficient compute power and economical resource requirement. However, most programming languages do not have proper abstractions for SIMD computing. For example, loop-auto-vectorization is a compiler optimization that tries to translate traditional scalar programs to vector instructions and totally hides the underlying SIMD architectures. However, this solution has been proven inefficient in practice, especially in restricted environments (e.g., dynamic compilation). On the other hand, directly exposing SIMD architectures to higher level languages without any abstraction (i.e., inline assembly) makes programming very difficult and compiler optimizations unavailable. Consequently, hardware intrinsic functions plays a balancing role between high-level abstraction and low-level assembly programming and achieves great success in C/C++ SIMD programming. 

Intrinsics are special functions that you cannot implement by yourself in the programming language that you are using. Hardware intrinsic functions are special functions that can be directly converted to a single (or a few) hardware instructions by the compiler, so that it exposes the underlying instruction architecture without abstraction overhead. Intrinsic functions perfectly integrate with other language features because they are just "functions". For example, intrinsic operates over variables instead of registers that assembly languages have but higher-level languages are not aware. Hardware intrinsics have been a native language (e.g., C/C++) feature for a long time. Although intrinsic functions can significantly improve the productivity of SIMD (or other hardware-dependent) programming, certain inherent drawbacks of native languages (e.g., manual memory management) make programming still difficult. Managed runtimes such as .NET Core are designed to improve programmer productivity and security by providing higher abstraction layers, type safety, and automatic memory management. This new feature, hardware intrinsics in .NET Core 3.0, combines the advantages of SIMD programming and managed languages (C#).

## New Namespaces and Classes
As it was mentioned above, hardware intrinsics will be available as a formal and built-in feature in .NET Core 3.0 which exposes new namespaces, SIMD types, and classes representing different Instruction Set Architectures (ISA). The top-level namespaces are:
1. `System.Runtime.Intrinsics`: contains SIMD types which abstract the underlying SIMD registers. `Vector128<T>` and `Vector256<T>` where `T` can be instantiated to any C# numeric type correspond to XMM and YMM registers on Intel ISA, respectively. This namespace also contains certain platform-agnostic convenience functions that provide common vector operations, e.g., initializing a vector with specified elements.
2. `System.Runtime.Intrinsics.X86`: contains classes representing different Intel ISAs spanning SSE, SSE2, SSE3, SSSE3, SSE4.1, SSE4.2, AVX, AVX2, FMA, LZCNT, POPCNT, BMI1, BMI2, PCLMULQDQ, and AES. For example, class `Avx` has many static methods that each of them maps to an AVX instruction. You can let the compiler generate `vaddps ymm, ymm, ymm` by calling `Avx.Add(vector1, vector2)` where `vector1/2` are instances of `Vector256<float>`. Particularity, each class has a boolean property called `IsSupported` which developers can use to check the underlying hardware support and contains intrinsic methods that operate over scalar or SIMD data. So, a hardware accelerated algorithm in .NET Core 3.0 usually has the top-level structure like below
```csharp
if (Avx2.IsSupported)
{
    // The AVX/AVX2 optimizing implementation for Intel Haswell or above CPUs  
}
else if (Sse41.IsSupported)
{
    // The SSE optimizing implementation for older x86 CPUs  
}
else if (Arm.Arm64.Simd.IsSupported)
{
    // The NEON optimizing implementation for ARM64 CPUs
}
else
{
    // Scalar or software-fallback implementation
}
```
In this example, you may be curious about the `Arm.Arm64` path. Yes, .NET Core hardware intrinsic system also has the ARM counterpart (under namespace `System.Runtime.Intrinsics.Arm.Arm64`) that is originally designed and implemented by QCOM engineers. However, the progress of the ARM side is quite different from x86 in .NET Core 3.0, and its availability depends on the ARM64 version of .NET Core releasing. In this day, I am not sure about the status of ARM64 support in .NET Core 3.0, so please watch for Microsoft's official announcement if you want this feature on ARM. 

## SIMD Programming in .NET Core
Although the hardware intrinsic system is not only about SIMD, the SIMD intrinsics are the most exciting part. So, I would like to give a simple SIMD example to demonstrate how to use hardware intrinsic in your C# programs. I will keep it as simple as possible. If you are interested in deeper knowledge about SIMD, I will dive into it in the next blog with lovely C# code.

Let's `dotnet new` a console application template and copy the code below to `Program.cs` file. You do not need to install any NuGet package because hardware intrinsic is an official feature in the core library of .NET Core 3.0. So, please make sure you have .NET Core SDK 3.0 installed (before .NET Core 3.0 formally released, I recommend using the daily build).
```csharp
using System.Runtime.Intrinsics;
using System.Runtime.Intrinsics.X86;

static unsafe float[] SimdAdd(float[] a, float[] b, int n)
{
    float[] result = new float[n];
    fixed(float* ptr_a = a, ptr_b = b, ptr_res = result)
    {
        for (int i = 0; i < n; i += Vector256<float>.Count)
        {
            Vector256<float> v1 = Avx.LoadVector256(ptr_a + i);
            Vector256<float> v2 = Avx.LoadVector256(ptr_b + i);
            Vector256<float> res = Avx.Add(v1, v2);
            Avx.Store(ptr_res + i, res);
        }
    }
    return result;
}
```
This function adds two arrays and returns the sum in a new array. This function is not real product code, it is simplified for demo only. Firstly, we need `using` two namespaces. As mentioned above, `System.Runtime.Intrinsics` is for `Vector256<float>` in this program, and `System.Runtime.Intrinsics.X86` is for using `Avx` intrinsics (e.g., `Avx.LoadVector256(ptr_a + i)`). Secondly, this function, `SimdAdd` has to be defined with `unsafe` keyword because `Avx.LoadVector256` and `Avx.Store` operates over "pointers" to read the input data and write the computation result back to memory. Overall, we have two kinds of hardware intrinsics under `System.Runtime.Intrinsics.X86` namespace:
1. Computing intrinsics: this is the major group of intrinsic APIs. Usually, they take parameters with  SIMD types (`Vector128<T>`, `Vector256<T>`, etc.) and/or scalar numeric types (`int`, `float`, `ushort`, etc), return a computing result. `Avx.Add` is a typical example of this group.
2. Memory-access intrinsics: SIMD computing intrinsics accept input data that is already in vector variables. However, data is usually organized in memory/file with their own format/types rather than `Vector128<T>` and `Vector256<T>`. So, we need memory-access intrinsics to convert in-memory data between in-variable vectors. The most common memory-access intrinsics are `Sse.LoadVector128`, `Sse2.LoadVector128`, `Avx.LoadVector256`, and `Sse.Store`, `Sse2.Store`, `Avx.Store`. 

The main functionality of `SimdAdd` is fulfilled by `Avx.Add` that takes two vectors of `float` (each vector contain 8 `float` numbers), adds `float` numbers 8-by-8 (256-bit/32-bit == 8), and puts the sum vector in a new `Vector256<float>` variable (`res`).

Finally, preparing two input arrays and calling `SimdAdd` from another function (e.g., `Main`) to see the result
```csharp
if (Avx.IsSupported)
{
    sum = SimdAdd(a, b, 256);
}
```
Note, please check the hardware capability (by `IsSupported`) before calling any platform-specific intrinsic. Executing hardware intrinsic on incorrect hardware platforms would throw `System.PlatformNotSupportedException`.
```
> dotnet run

Unhandled Exception: System.PlatformNotSupportedException: Operation is not supported on this platform.
   at System.Runtime.Intrinsics.X86.Avx.LoadVector256(Single* address)
   at IntrinsicDemo.IntrinsicDemo.SimdAdd(Single[] a, Single[] b, Int32 n) in /Users/fiigii/workspace/test/IntrinsicDemo/Program.cs:line 30
   at IntrinsicDemo.IntrinsicDemo.Main(String[] args) in /Users/fiigii/workspace/test/IntrinsicDemo/Program.cs:line 17
```

You may wonder how I got such an old CPU that does not support AVX instructions for showing the above message. Actually, during developing this feature in JIT compiler, we have considered the situations that hardware specific programs are difficult to test for all the hardware. So, we provide several environment variables to save developers' money from purchasing old hardware for testing :). For example, you can set `COMPlus_EnableAVX=0` to disable AVX  (and newer ISAs that depend on AVX) in your .NET Core process. Then, the code path for older CPUs can be tested on new machines. .NET Core 3.0 has one such environment variable for each `x86` ISA (e.g., `COMPlus_EnableSSE41`, `COMPlus_EnableAVX2`, `COMPlus_EnableFMA`, etc.).

Additionally, you may think the `Simd.Add` code too verbose since every intrinsic call has a leading ISA name (`Avx.Add`). Fortunately, this verbose can be avoided by C# `using static`
```csharp
using static System.Runtime.Intrinsics.X86.Avx;

...

Vector256<float> v1 = LoadVector256(ptr_a + i);
Vector256<float> v2 = LoadVector256(ptr_b + i);
Vector256<float> res = Add(v1, v2);
Store(ptr_res + i, res);
```
We intentionally designed every intrinsic API to work with `using static` without conflicts, even if the program mixes intrinsics from different ISAs.

## Further Studying
The hardware intrinsic system in .NET Core 3.0 is not only a bunch of new APIs, that also opens the door of low-level programming and high-performance computing for .NET Core programmers. So, I plan to write a series of blogs to introduce the intrinsic APIs, SIMD programming in C#, and JIT compiler optimizations. But you might have no patience to wait for the next article, no worries, here are some materials that help for further studying
- API documentation: There is no formal documentation for hardware intrinsic yet before .NET Core 3.0 release. But everything in .NET Core is open source, you can take a look at the source code of these APIs at [here](https://github.com/dotnet/coreclr/tree/master/src/System.Private.CoreLib/shared/System/Runtime/Intrinsics/X86), which each API has comments that correspond to C/C++ intrinsic APIs and x86 assembly instructions. Then you can reuse the [C/C++ intrinsic API documentation provided by Intel](https://software.intel.com/sites/landingpage/IntrinsicsGuide/) that is pretty straightforward for developers who have C/C++ experience.
- Performance analysis: Improving performance is the main purpose to use hardware intrinsic. [BecnmarkDotnet](https://benchmarkdotnet.org/articles/overview.html) is an open source profiler for .NET Core applications and it is easy to use. Meanwhile, I really like [Intel VTune](https://software.intel.com/en-us/vtune) that provides more sophisticated runtime hardware information, which is better for optimizing but understanding VTune output requires a bit of hardware knowledge.
- More hardware intrinsic examples:  the .NET Core community has leveraged intrinsics to optimize the library code in [CoreFX](https://github.com/dotnet/corefx) and [CoreCLR](https://github.com/dotnet/coreclr) repos, watching related issues and PRs on GitHub is a good approach to learn. For example, [Ben Adams](https://github.com/benaadams)'s [PRs that vectorizing `IndexOf`](https://github.com/dotnet/coreclr/pull/22187#issuecomment-467872251). There are also some individual projects that heavily use hardware intrinsics, [SimdJsonSharp](https://github.com/EgorBo/SimdJsonSharp) is a C# port of SimdJson algorithm that accelerates JSON parsing using AVX2 instructions. [PacketTracer](https://github.com/fiigii/PacketTracer) is an SoA-vectorized ray tracing that is used to investigating .NET Core SIMD code generation quality.
<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">PacketTracer is a SoA vectorized raytracer in .NET Core AVX intrinsic. We are using it to investigate CoreCLR SIMD code generation quality and it shows ~7x faster than the Vector3 AoS version. See <a href="https://t.co/ZHUmpvarwn">https://t.co/ZHUmpvarwn</a> <a href="https://t.co/tHEqbijFNn">pic.twitter.com/tHEqbijFNn</a></p>&mdash; Fei Peng (@fiigii) <a href="https://twitter.com/fiigii/status/1096512607471595520?ref_src=twsrc%5Etfw">February 15, 2019</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>


---
title: "设计模式"
date: "2025-02-16T15:16:25+08:00"
draft: false
license: false
---

### 单例模式
一个类中只产生一个对象，并提供一个外部访问点，被程序全员共享，简化了在复杂环境下的配置管理，这种模式被成为单例模式。

特征：
1. 单例类最多只能有一个实例；
2. 单例类必须自己创建自己唯一的实例； 
3. 单例类必须给所有其他的对象提供这一实例。

优点：1.内存中该类只实例化了一个对象，减少了内存的消耗；2.避免资源的重复占用
缺点：单例类的话，不能被继承，因为它的构造函数那些东西都是私有(private)的；

一、饿汉模式
不管用不用，在程序开始就加载，会导致程序启动慢，且如果有多个单例类对象实例启动顺序不确定。
线程安全，一共只生成一个静态对象。
饿汉模式虽好，但其存在隐藏的问题，在于非静态对象（函数外的static对象）在不同编译单元中的初始化顺序是未定义的。如果在初始化完成之前调用 getInstance() 方法会返回一个未定义的实例。

将单例类的唯一对象实例，通过一个静态成员变量来实现，加载进程时即完成创建，无论用或不用该单例对象都一直存在。
当这个对象特别大的时候，无论你用不用该对象，在使用程序开始的那一课开始，对象已经存在，会造成巨大的内存浪费。
```CPP
// .h
class HungerSingleton {
private:
	static HungerSingleton instance;	//静态对象
	HungerSingleton();
	~HungerSingleton();
	//防拷贝
	HungerSingleton(const HungerSingleton&) = delete;
	HungerSingleton& operator=(const HungerSingleton&) = delete;
public:
	static HungerSingleton* GetInstance();
	void func(int n)
	{
		std::cout << n << std::endl;
		Sleep(n);
	}
};


// .cpp
#include"HungerSingleton.h"
HungerSingleton HungerSingleton::instance;	//类外初始化

HungerSingleton* HungerSingleton::GetInstance() {
	return &instance;
}
HungerSingleton::HungerSingleton() {
	std::cout << "HungerSingleton构造函数" << std::endl;
}
HungerSingleton::~HungerSingleton() {
	std::cout << "HungerSingleton析构函数" << std::endl;
}


// main
int main() {	//HungerSingleton构造函数
	auto hung = HungerSingleton::GetInstance();
	hung->func(5);	//5
	hung->func(3);	//3
	return 0;	//HungerSingleton析构函数
}
```


二、懒汉模式
等到用的的时候程序再创建实例对象
第一次使用实例对象时，创建对象，进程启动无负载。多个单例实例启动顺序自由控制
非线程安全，当多进程同时创建时，会发生争抢，需要加锁和双重检验
无内存管理，会发生内存泄漏

1.简易版

	为保证多线程下的线程安全，使用双重检验，对单例对象加锁保证竞争不会重复创建
```CPP
/*
*	LazySingleton.h
*/
#pragma once
#ifndef _LAZYSINGLETON_H_
#define _LAZYSINGLETON_H_
#include <iostream>
#include <mutex>

class LazySingleton {
private:
	static LazySingleton* instance;	//指向对象的指针
	LazySingleton();
	~LazySingleton();
	static std::mutex m_mtx; //互斥锁
public:
	static LazySingleton* GetInstance();
};
#endif // !_LAZYSINGLETON_H_


/*
*	LazySingleton.cpp
*/
#include"LazySingleton.h"

LazySingleton* LazySingleton::instance = nullptr;	//初始化为空指针
std::mutex LazySingleton::m_mtx;

LazySingleton::LazySingleton() {
	std::cout << "LazySingleton构造函数" << std::endl;
}

LazySingleton::~LazySingleton() {
	std::cout << "LazySingleton析构函数" << std::endl;
}

LazySingleton* LazySingleton::GetInstance() {
	if (instance == nullptr) {
		//加锁
		std::lock_guard<std::mutex>lock(m_mtx);	//类模板，只提供构造函数和析构函数，在析构时自动解锁，可以使用{}来限制使用范围
		if (instance == nullptr) {	//双重检验
			instance = new LazySingleton();
		}
	}
	return instance;
}


void func(int n)
{
	cout << LazySingleton::GetInstance() << endl;
}

int main() {
	thread t1(func, 10);
	thread t2(func, 10);
	t1.join();	//进程1运行：创建LazySingleton	单例对象地址不变
	t2.join();	//进程2运行：不用创建
	cout << LazySingleton::GetInstance() << endl;	//不用创建
	cout << LazySingleton::GetInstance() << endl;	//不用创建
	//懒汉模式不会自动析构
	return 0;
}
```

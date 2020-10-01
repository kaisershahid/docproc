# Plugins

The plugin system for docproc is pretty basic -- your module simply provides the following exported member:

```
export const registerPlugin = (docproc: DocProcessor, opts?: PluginOptions): void => {}
```

This function will then access the other services within docproc to attach block handlers, inline handlers, lexemes, and potentially also hook into other loaded plugins' services as well as registering your own. Example: 

```typescript
export const registerPlugin = (docproc: DocProcessor, opts?: PluginOptions): void => {
    const lexer = docproc.getLexer();
    lexer.setLexeme('!', {priority:1});
    
    const blockManager = docproc.getBlockManager();
    blockManager.addHandler(new YourHandler());
    
    const pluginServicesManager = docproc.getPluginServiceManager();
    
    // hook into another plugin's service
    const anotherPluginSvc = pluginServicesManager.getService<ServiceType>("other-plugin", "service-id");
    anotherPluginSvc.whatever();
    
    // register your own service
    pluginServicesManager.addService("your-plugin-name", "your-id", new SvcInstance());
}
```

That's it!

> `opts` might contain overrides for the plugin. See [Document Settings](./doc-settings.md) for defining plugin options.

## Publishing Plugins

TBD
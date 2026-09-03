import os

base = "app/under-admin/users/[userId]/projects/[projectId]/editor-dashboard"
pages = [
    "interior/page.tsx",
    "animation-walkthrough/page.tsx",
    "webar/page.tsx",
    "webxr/page.tsx",
    "virtual-reality/page.tsx",
    "gaussian-splat/page.tsx",
    "pixel-streaming/page.tsx",
    "virtual-tour/page.tsx",
]

for page in pages:
    path = os.path.join(base, page)
    service = page.split("/")[0]
    title = service.replace("-", " ").title()
    
    with open(path, "r") as f:
        content = f.read()
    
    # Add imports
    content = content.replace(
        "import { ServiceEditorPanels, Tab } from '@/components/editor/service-editor-panels';",
        "import { ServiceEditorPanels, Tab } from '@/components/editor/service-editor-panels';\nimport { EditorErrorBoundary } from '@/components/editor/editor-error-boundary';\nimport { PermissionProvider } from '@/components/editor/permissions';"
    )
    
    # Add serviceTitle variable
    content = content.replace(
        '  const serviceSlug = "{}";'.format(service),
        '  const serviceSlug = "{}";\n  const serviceTitle = "{}";'.format(service, title)
    )
    
    # Wrap return with error boundary and permissions
    old_return = """  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <div className="px-4 sm:px-6 py-3 border-b border-[#27272A]">
        <h1 className="text-sm font-mono font-bold text-white capitalize">{service.replace("-", " ")}</h1>
        <p className="text-[10px] font-mono text-[#71717A]">{params?.userId} / {params?.projectId} / {service}</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <ServiceEditorPanels tabs={tabs} tabData={data} loading={loading} error={error} />
      </div>
    </div>
  );
}"""
    
    new_return = """  return (
    <EditorErrorBoundary serviceName={serviceTitle}>
      <PermissionProvider role="owner">
        <div className="min-h-screen bg-[#09090B] text-white">
          <div className="px-4 sm:px-6 py-3 border-b border-[#27272A]">
            <h1 className="text-sm font-mono font-bold text-white capitalize">{serviceTitle}</h1>
            <p className="text-[10px] font-mono text-[#71717A]">{params?.userId} / {params?.projectId} / {service}</p>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <ServiceEditorPanels tabs={tabs} tabData={data} loading={loading} error={error} />
          </div>
        </div>
      </PermissionProvider>
    </EditorErrorBoundary>
  );
}"""
    
    content = content.replace(old_return, new_return)
    
    with open(path, "w") as f:
        f.write(content)
    
print("wrapped remaining pages with error boundary and permissions")

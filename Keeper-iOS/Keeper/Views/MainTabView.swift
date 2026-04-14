import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        TabView(selection: $appState.selectedTab) {
            DashboardView()
                .tabItem {
                    Label("Home", systemImage: appState.selectedTab == 0 ? "house.fill" : "house")
                }
                .tag(0)

            FindingsView()
                .tabItem {
                    Label("Findings", systemImage: appState.selectedTab == 1 ? "exclamationmark.shield.fill" : "exclamationmark.shield")
                }
                .tag(1)
                .badge(appState.detectedIssues.filter { $0.status == .new }.count)

            InvestView()
                .tabItem {
                    Label("Invest", systemImage: appState.selectedTab == 2 ? "chart.line.uptrend.xyaxis.circle.fill" : "chart.line.uptrend.xyaxis.circle")
                }
                .tag(2)

            ChatView()
                .tabItem {
                    Label("Ask AI", systemImage: appState.selectedTab == 3 ? "bubble.left.and.bubble.right.fill" : "bubble.left.and.bubble.right")
                }
                .tag(3)

            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: appState.selectedTab == 4 ? "person.circle.fill" : "person.circle")
                }
                .tag(4)
        }
        .tint(Color.keeperGreen)
        .alert(
            appState.activeError?.title ?? "Error",
            isPresented: Binding(
                get: { appState.activeError != nil },
                set: { if !$0 { appState.clearError() } }
            )
        ) {
            Button("OK") { appState.clearError() }
        } message: {
            Text(appState.activeError?.message ?? "")
        }
    }
}

#Preview {
    MainTabView()
        .environmentObject(AppState())
}

import SideNav from './SideNav';

function Header() {
  return (
    <div className="flex justify-between bg-gray-900 text-white p-6">
      <div>
        <h1 className="text-lg font-bold">Crypto Watcher</h1>
      </div>
      <SideNav />
    </div>
  );
}

export default Header;
